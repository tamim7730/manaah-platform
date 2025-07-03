import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { DatabaseService } from './database.js';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'researcher' | 'viewer';
  created_at: Date;
  updated_at: Date;
}

export interface AuthToken {
  token: string;
  user: Omit<User, 'password'>;
  expires_at: Date;
}

export class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    if (this.jwtSecret === 'default_secret_key') {
      console.warn('[Auth Warning] Using default JWT secret. Please set JWT_SECRET environment variable.');
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateToken(user: Omit<User, 'password'>): string {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'manaah-platform',
      audience: 'manaah-mcp-server'
    } as jwt.SignOptions);
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: 'manaah-platform',
        audience: 'manaah-mcp-server'
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  async authenticateUser(username: string, password: string, dbService: DatabaseService): Promise<AuthToken | null> {
    try {
      const result = await dbService.query(
        'SELECT id, username, email, password, role, created_at, updated_at FROM users WHERE username = $1 OR email = $1',
        [username]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      const isValidPassword = await this.verifyPassword(password, user.password);

      if (!isValidPassword) {
        return null;
      }

      const userWithoutPassword = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      const token = this.generateToken(userWithoutPassword);
      const decoded = this.verifyToken(token) as any;
      
      return {
        token,
        user: userWithoutPassword,
        expires_at: new Date(decoded.exp * 1000)
      };
    } catch (error) {
      console.error('[Auth Error] Authentication failed:', error);
      throw error;
    }
  }

  async createUser(
    userData: {
      username: string;
      email: string;
      password: string;
      role: 'admin' | 'researcher' | 'viewer';
    },
    dbService: DatabaseService
  ): Promise<User> {
    try {
      const hashedPassword = await this.hashPassword(userData.password);
      
      const result = await dbService.query(
        `INSERT INTO users (username, email, password, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, username, email, role, created_at, updated_at`,
        [userData.username, userData.email, hashedPassword, userData.role]
      );

      return result.rows[0];
    } catch (error) {
      console.error('[Auth Error] User creation failed:', error);
      throw error;
    }
  }

  async getUserById(userId: string, dbService: DatabaseService): Promise<User | null> {
    try {
      const result = await dbService.query(
        'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1',
        [userId]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('[Auth Error] Get user by ID failed:', error);
      throw error;
    }
  }

  async updateUserRole(
    userId: string, 
    newRole: 'admin' | 'researcher' | 'viewer',
    dbService: DatabaseService
  ): Promise<User | null> {
    try {
      const result = await dbService.query(
        `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING id, username, email, role, created_at, updated_at`,
        [newRole, userId]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('[Auth Error] Update user role failed:', error);
      throw error;
    }
  }

  async deleteUser(userId: string, dbService: DatabaseService): Promise<boolean> {
    try {
      const result = await dbService.query(
        'DELETE FROM users WHERE id = $1',
        [userId]
      );

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('[Auth Error] Delete user failed:', error);
      throw error;
    }
  }

  hasPermission(userRole: string, requiredRole: string): boolean {
    const roleHierarchy = {
      'viewer': 1,
      'researcher': 2,
      'admin': 3
    };

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userLevel >= requiredLevel;
  }

  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}