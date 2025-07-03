"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/stats-card"
import { Shield, FileText, LogOut, Plus, Eye, AlertTriangle, CheckCircle, Clock, ArrowRight, Edit, Trash2, Map } from "lucide-react"
import Link from "next/link"
import { SimpleMapModal, AllMapsModalComponent } from "@/components/map-modal"
import { SurveyDetailModal } from "@/components/survey-detail-modal"

// بيانات المستخدم الوهمية
const mockUser = {
  fullName: "مدير النظام",
  username: "admin",
  email: "admin@manaah.gov.sa",
  role: "admin",
}

const mockDiseases = [
  { id: 1, nameAr: "حمى الوادي المتصدع", code: "RVF", category: "Viral", severityLevel: "high", isActive: true },
]

// تعريف الأحزمة الوبائية
const epidemiologicalBelts = {
  red: {
    id: "red",
    nameAr: "الحزام الأحمر",
    description: "حزام السيطرة على المرض ومنع انتشاره إلى بقية مناطق المملكة ويتميز بارتفاع مخاطر الاصابة بالمرض",
    riskLevel: "عالي جداً",
    color: "#dc2626",
    governorates: ["الطوال", "الحرث", "العارضة", "فيفا", "الدائر", "العيدابي", "الريث"]
  },
  orange: {
    id: "orange",
    nameAr: "الحزام البرتقالي",
    description: "محافظات قد سبق أن سُجلت الإصابة فيها تاريخياً منذ الاندلاعة الأولى في 1421هـ ومجاورة لمحافظات الحزام الأحمر",
    riskLevel: "عالي",
    color: "#ea580c",
    governorates: [
      // منطقة جازان
      "جازان", "ضمد", "صبيا", "هروب", "بيش", "الدرب", "أبو عريش", "أحد المسارحة",
      // منطقة عسير
      "محايل عسير", "رجال ألمع", "المجاردة", "الحريضة", "قناة والبحر", "السعيدة", "تهامة ابها",
      // منطقة مكة المكرمة
      "القنفذة"
    ]
  },
  yellow: {
    id: "yellow",
    nameAr: "الحزام الأصفر",
    description: "حزام مراقبة وبائية، لم يسبق أن سُجلت الإصابة فيها تاريخياً منذ الاندلاعة الأولى في 1421 هـ",
    riskLevel: "متوسط",
    color: "#eab308",
    governorates: [
      // منطقة مكة المكرمة
      "الليث", "العرضيات",
      // منطقة عسير
      "النماص", "تنومة", "خميس مشيط", "أحد رفيدة", "أبها", "سراة عبيدة", "ظهران الجنوب",
      // منطقة الباحة
      "المخواة", "قلوة",
      // منطقة نجران
      "نجران", "شرورة", "حبونا", "بدر الجنوب", "يدمة", "ثار", "خباش"
    ]
  },
  green: {
    id: "green",
    nameAr: "الحزام الأخضر",
    description: "حزام خال من المرض السريري والعدوى معاً، يشمل جميع مناطق المملكة عدا المناطق المذكورة في الأحزمة السابقة",
    riskLevel: "منخفض",
    color: "#16a34a",
    governorates: [] // جميع المحافظات الأخرى
  }
}

// دالة لتحديد الحزام الوبائي للمحافظة
function getEpidemiologicalBelt(governorateName: string) {
  for (const [key, belt] of Object.entries(epidemiologicalBelts)) {
    if (key !== 'green' && (belt.governorates as string[]).includes(governorateName)) {
      return belt
    }
  }
  return epidemiologicalBelts.green
}

// بيانات المناطق والمحافظات مع المسوحات
const mockRegions = [
  {
    id: 1,
    nameAr: "منطقة الرياض",
    governorates: [
      { id: 1, nameAr: "الرياض", regionId: 1, surveys: [
        { 
          id: 1, 
          surveyNumber: "الأول", 
          date: "2025-01-01", 
          status: "completed", 
          totalSamples: 864, 
          positiveSamples: 12, 
          negativeSamples: 852, 
          prevalenceRate: ((12 / 864) * 100).toFixed(2),
          suspectedCases: 864, 
          confirmedCases: 12, 
          deaths: 0, 
          recoveries: 10,
          livestock: {
            sheep: 2099877,
            cattle: 335381,
            horses: 0,
            camels: 114131,
            goats: 330007
          },
          governoratesIncluded: ["الأفلاج", "الحريق", "الخرج", "الدرعية", "الدلم", "الدوادمي", "الزلفي", "السليل", "الغاط", "القويعية", "المجمعة", "المزاحمية", "ثادق", "حريملاء", "حوطة بني تميم", "رماح", "شقراء", "ضرماء", "عفيف", "مدينة الرياض"]
        },
        { 
          id: 2, 
          surveyNumber: "الثاني", 
          date: "2025-02-01", 
          status: "completed", 
          totalSamples: 920, 
          positiveSamples: 8, 
          negativeSamples: 912, 
          prevalenceRate: ((8 / 920) * 100).toFixed(2),
          suspectedCases: 920, 
          confirmedCases: 8, 
          deaths: 0, 
          recoveries: 7,
          livestock: {
            sheep: 2099877,
            cattle: 335381,
            horses: 0,
            camels: 114131,
            goats: 330007
          },
          governoratesIncluded: ["الأفلاج", "الحريق", "الخرج", "الدرعية", "الدلم", "الدوادمي", "الزلفي", "السليل", "الغاط", "القويعية", "المجمعة", "المزاحمية", "ثادق", "حريملاء", "حوطة بني تميم", "رماح", "شقراء", "ضرماء", "عفيف", "مدينة الرياض"]
        },
        { 
          id: 3, 
          surveyNumber: "الثالث", 
          date: "2025-03-01", 
          status: "ongoing", 
          totalSamples: 750, 
          positiveSamples: 5, 
          negativeSamples: 745, 
          prevalenceRate: ((5 / 750) * 100).toFixed(2),
          suspectedCases: 750, 
          confirmedCases: 5, 
          deaths: 0, 
          recoveries: 4,
          livestock: {
            sheep: 2099877,
            cattle: 335381,
            horses: 0,
            camels: 114131,
            goats: 330007
          },
          governoratesIncluded: ["الأفلاج", "الحريق", "الخرج", "الدرعية", "الدلم", "الدوادمي", "الزلفي", "السليل", "الغاط", "القويعية", "المجمعة", "المزاحمية", "ثادق", "حريملاء", "حوطة بني تميم", "رماح", "شقراء", "ضرماء", "عفيف", "مدينة الرياض"]
        }
      ]},
      { id: 2, nameAr: "الدرعية", regionId: 1, surveys: [] },
      { id: 3, nameAr: "الخرج", regionId: 1, surveys: [] },
      { id: 4, nameAr: "الدوادمي", regionId: 1, surveys: [] },
      { id: 5, nameAr: "المجمعة", regionId: 1, surveys: [] },
      { id: 6, nameAr: "القويعية", regionId: 1, surveys: [] },
      { id: 7, nameAr: "الأفلاج", regionId: 1, surveys: [] },
      { id: 8, nameAr: "وادي الدواسر", regionId: 1, surveys: [] },
      { id: 9, nameAr: "الزلفي", regionId: 1, surveys: [] },
      { id: 10, nameAr: "شقراء", regionId: 1, surveys: [] },
      { id: 11, nameAr: "حوطة بني تميم", regionId: 1, surveys: [] },
      { id: 12, nameAr: "عفيف", regionId: 1, surveys: [] },
      { id: 13, nameAr: "الغاط", regionId: 1, surveys: [] },
      { id: 14, nameAr: "السليل", regionId: 1, surveys: [] },
      { id: 15, nameAr: "ضرماء", regionId: 1, surveys: [] },
      { id: 16, nameAr: "المزاحمية", regionId: 1, surveys: [] },
      { id: 17, nameAr: "رماح", regionId: 1, surveys: [] },
      { id: 18, nameAr: "ثادق", regionId: 1, surveys: [] },
      { id: 19, nameAr: "حريملاء", regionId: 1, surveys: [] },
      { id: 20, nameAr: "الحريق", regionId: 1, surveys: [] },
      { id: 21, nameAr: "مرات", regionId: 1, surveys: [] },
      { id: 22, nameAr: "الدلم", regionId: 1, surveys: [] },
      { id: 23, nameAr: "الرين", regionId: 1, surveys: [] }
    ]
  },
  {
    id: 2,
    nameAr: "منطقة مكة المكرمة",
    governorates: [
      { id: 24, nameAr: "مكة المكرمة", regionId: 2, surveys: [
        { 
          id: 4, 
          surveyNumber: "الأول", 
          date: "2025-01-01", 
          status: "completed", 
          totalSamples: 720, 
          positiveSamples: 8, 
          negativeSamples: 712, 
          prevalenceRate: ((8 / 720) * 100).toFixed(2),
          suspectedCases: 720, 
          confirmedCases: 8, 
          deaths: 0, 
          recoveries: 6,
          livestock: {
            sheep: 2689198,
            cattle: 9471,
            horses: 0,
            camels: 41314,
            goats: 816666
          },
          governoratesIncluded: ["مكة المكرمة", "جدة", "الطائف", "القنفذة", "الليث"]
        },
        { 
          id: 16, 
          surveyNumber: "الثاني", 
          date: "2025-02-01", 
          status: "completed", 
          totalSamples: 780, 
          positiveSamples: 6, 
          negativeSamples: 774, 
          prevalenceRate: ((6 / 780) * 100).toFixed(2),
          suspectedCases: 780, 
          confirmedCases: 6, 
          deaths: 0, 
          recoveries: 5,
          livestock: {
            sheep: 2689198,
            cattle: 9471,
            horses: 0,
            camels: 41314,
            goats: 816666
          },
          governoratesIncluded: ["مكة المكرمة", "جدة", "الطائف", "القنفذة", "الليث"]
        },
        { 
          id: 17, 
          surveyNumber: "الثالث", 
          date: "2025-03-01", 
          status: "ongoing", 
          totalSamples: 650, 
          positiveSamples: 4, 
          negativeSamples: 646, 
          prevalenceRate: ((4 / 650) * 100).toFixed(2),
          suspectedCases: 650, 
          confirmedCases: 4, 
          deaths: 0, 
          recoveries: 3,
          livestock: {
            sheep: 2689198,
            cattle: 9471,
            horses: 0,
            camels: 41314,
            goats: 816666
          },
          governoratesIncluded: ["مكة المكرمة", "جدة", "الطائف", "القنفذة", "الليث"]
        }
      ] },
      { id: 25, nameAr: "جدة", regionId: 2, surveys: [] },
      { id: 26, nameAr: "الطائف", regionId: 2, surveys: [] },
      { id: 27, nameAr: "القنفذة", regionId: 2, surveys: [] },
      { id: 28, nameAr: "الليث", regionId: 2, surveys: [] },
      { id: 29, nameAr: "رابغ", regionId: 2, surveys: [] },
      { id: 30, nameAr: "خليص", regionId: 2, surveys: [] },
      { id: 31, nameAr: "الخرمة", regionId: 2, surveys: [] },
      { id: 32, nameAr: "رنية", regionId: 2, surveys: [] },
      { id: 33, nameAr: "تربة", regionId: 2, surveys: [] },
      { id: 34, nameAr: "الجموم", regionId: 2, surveys: [] },
      { id: 35, nameAr: "الكامل", regionId: 2, surveys: [] },
      { id: 36, nameAr: "المويه", regionId: 2, surveys: [] },
      { id: 37, nameAr: "ميسان", regionId: 2, surveys: [] },
      { id: 38, nameAr: "أضم", regionId: 2, surveys: [] },
      { id: 39, nameAr: "العرضيات", regionId: 2, surveys: [] },
      { id: 40, nameAr: "بحرة", regionId: 2, surveys: [] }
    ]
  },
  {
    id: 3,
    nameAr: "منطقة المدينة المنورة",
    governorates: [
      { id: 41, nameAr: "المدينة المنورة", regionId: 3, surveys: [
        {
          id: 6,
          surveyNumber: "الأول",
          date: "2025-01-01",
          status: "completed",
          totalSamples: 500,
          positiveSamples: 5,
          negativeSamples: 495,
          prevalenceRate: ((5 / 500) * 100).toFixed(2),
          suspectedCases: 500,
          confirmedCases: 5,
          deaths: 0,
          recoveries: 4,
          livestock: {
            sheep: 1074142,
            cattle: 1483,
            horses: 0,
            camels: 34542,
            goats: 404184
          },
          governoratesIncluded: ["المدينة المنورة", "ينبع", "العلا", "مهد الذهب", "الحناكية"]
        },
        {
          id: 18,
          surveyNumber: "الثاني",
          date: "2025-02-01",
          status: "completed",
          totalSamples: 550,
          positiveSamples: 3,
          negativeSamples: 547,
          prevalenceRate: ((3 / 550) * 100).toFixed(2),
          suspectedCases: 550,
          confirmedCases: 3,
          deaths: 0,
          recoveries: 3,
          livestock: {
            sheep: 1074142,
            cattle: 1483,
            horses: 0,
            camels: 34542,
            goats: 404184
          },
          governoratesIncluded: ["المدينة المنورة", "ينبع", "العلا", "مهد الذهب", "الحناكية"]
        },
        {
          id: 19,
          surveyNumber: "الثالث",
          date: "2025-03-01",
          status: "ongoing",
          totalSamples: 480,
          positiveSamples: 2,
          negativeSamples: 478,
          prevalenceRate: ((2 / 480) * 100).toFixed(2),
          suspectedCases: 480,
          confirmedCases: 2,
          deaths: 0,
          recoveries: 2,
          livestock: {
            sheep: 1074142,
            cattle: 1483,
            horses: 0,
            camels: 34542,
            goats: 404184
          },
          governoratesIncluded: ["المدينة المنورة", "ينبع", "العلا", "مهد الذهب", "الحناكية"]
        }
      ] },
      { id: 42, nameAr: "ينبع", regionId: 3, surveys: [] },
      { id: 43, nameAr: "العلا", regionId: 3, surveys: [] },
      { id: 44, nameAr: "المهد", regionId: 3, surveys: [] },
      { id: 45, nameAr: "الحناكية", regionId: 3, surveys: [] },
      { id: 46, nameAr: "بدر", regionId: 3, surveys: [] },
      { id: 47, nameAr: "خيبر", regionId: 3, surveys: [] },
      { id: 48, nameAr: "العيص", regionId: 3, surveys: [] },
      { id: 49, nameAr: "وادي الفرع", regionId: 3, surveys: [] }
    ]
  },
  {
    id: 4,
    nameAr: "المنطقة الشرقية",
    governorates: [
      { id: 50, nameAr: "الدمام", regionId: 4, surveys: [
        { 
          id: 5, 
          surveyNumber: "الأول", 
          date: "2025-01-01", 
          status: "completed", 
          totalSamples: 650, 
          positiveSamples: 6, 
          negativeSamples: 644, 
          prevalenceRate: ((6 / 650) * 100).toFixed(2),
          suspectedCases: 650, 
          confirmedCases: 6, 
          deaths: 0, 
          recoveries: 5,
          livestock: {
            sheep: 2206283,
            cattle: 150972,
            horses: 0,
            camels: 81463,
            goats: 174079
          },
          governoratesIncluded: ["الدمام", "الأحساء", "حفر الباطن", "الجبيل", "القطيف"]
        },
        { 
          id: 20, 
          surveyNumber: "الثاني", 
          date: "2025-02-01", 
          status: "completed", 
          totalSamples: 700, 
          positiveSamples: 4, 
          negativeSamples: 696, 
          prevalenceRate: ((4 / 700) * 100).toFixed(2),
          suspectedCases: 700, 
          confirmedCases: 4, 
          deaths: 0, 
          recoveries: 4,
          livestock: {
            sheep: 2206283,
            cattle: 150972,
            horses: 0,
            camels: 81463,
            goats: 174079
          },
          governoratesIncluded: ["الدمام", "الأحساء", "حفر الباطن", "الجبيل", "القطيف"]
        },
        { 
          id: 21, 
          surveyNumber: "الثالث", 
          date: "2025-03-01", 
          status: "ongoing", 
          totalSamples: 580, 
          positiveSamples: 3, 
          negativeSamples: 577, 
          prevalenceRate: ((3 / 580) * 100).toFixed(2),
          suspectedCases: 580, 
          confirmedCases: 3, 
          deaths: 0, 
          recoveries: 2,
          livestock: {
            sheep: 2206283,
            cattle: 150972,
            horses: 0,
            camels: 81463,
            goats: 174079
          },
          governoratesIncluded: ["الدمام", "الأحساء", "حفر الباطن", "الجبيل", "القطيف"]
        }
      ] },
      { id: 51, nameAr: "الأحساء", regionId: 4, surveys: [] },
      { id: 52, nameAr: "حفر الباطن", regionId: 4, surveys: [] },
      { id: 53, nameAr: "الجبيل", regionId: 4, surveys: [] },
      { id: 54, nameAr: "القطيف", regionId: 4, surveys: [] },
      { id: 55, nameAr: "الخبر", regionId: 4, surveys: [] },
      { id: 56, nameAr: "العديد", regionId: 4, surveys: [] },
      { id: 57, nameAr: "الخفجي", regionId: 4, surveys: [] },
      { id: 58, nameAr: "رأس تنورة", regionId: 4, surveys: [] },
      { id: 59, nameAr: "ابقيق", regionId: 4, surveys: [] },
      { id: 60, nameAr: "النعيرية", regionId: 4, surveys: [] },
      { id: 61, nameAr: "قرية العليا", regionId: 4, surveys: [] },
      { id: 62, nameAr: "البيضاء", regionId: 4, surveys: [] }
    ]
  },
  {
    id: 5,
    nameAr: "منطقة القصيم",
    governorates: [
      { id: 63, nameAr: "بريدة", regionId: 5, surveys: [
        {
          id: 7,
          surveyNumber: "الأول",
          date: "2025-01-01",
          status: "completed",
          totalSamples: 100,
          positiveSamples: 0,
          negativeSamples: 100,
          prevalenceRate: "0.00",
          suspectedCases: 100,
          confirmedCases: 0,
          deaths: 0,
          recoveries: 0,
          livestock: {
            sheep: 0,
            cattle: 0,
            horses: 0,
            camels: 0,
            goats: 0
          },
          governoratesIncluded: ["بريدة", "عنيزة", "الرس", "المذنب", "البكيرية"]
        },
        {
          id: 22,
          surveyNumber: "الثاني",
          date: "2025-02-01",
          status: "completed",
          totalSamples: 120,
          positiveSamples: 0,
          negativeSamples: 120,
          prevalenceRate: "0.00",
          suspectedCases: 120,
          confirmedCases: 0,
          deaths: 0,
          recoveries: 0,
          livestock: {
            sheep: 0,
            cattle: 0,
            horses: 0,
            camels: 0,
            goats: 0
          },
          governoratesIncluded: ["بريدة", "عنيزة", "الرس", "المذنب", "البكيرية"]
        },
        {
          id: 23,
          surveyNumber: "الثالث",
          date: "2025-03-01",
          status: "ongoing",
          totalSamples: 90,
          positiveSamples: 0,
          negativeSamples: 90,
          prevalenceRate: "0.00",
          suspectedCases: 90,
          confirmedCases: 0,
          deaths: 0,
          recoveries: 0,
          livestock: {
            sheep: 0,
            cattle: 0,
            horses: 0,
            camels: 0,
            goats: 0
          },
          governoratesIncluded: ["بريدة", "عنيزة", "الرس", "المذنب", "البكيرية"]
        }
      ] },
      { id: 64, nameAr: "عنيزة", regionId: 5, surveys: [] },
      { id: 65, nameAr: "الرس", regionId: 5, surveys: [] },
      { id: 66, nameAr: "المذنب", regionId: 5, surveys: [] },
      { id: 67, nameAr: "البكيرية", regionId: 5, surveys: [] },
      { id: 68, nameAr: "البدائع", regionId: 5, surveys: [] },
      { id: 69, nameAr: "الأسياح", regionId: 5, surveys: [] },
      { id: 70, nameAr: "النبهانية", regionId: 5, surveys: [] },
      { id: 71, nameAr: "الشماسية", regionId: 5, surveys: [] },
      { id: 72, nameAr: "عيون الجواء", regionId: 5, surveys: [] },
      { id: 73, nameAr: "رياض الخبراء", regionId: 5, surveys: [] },
      { id: 74, nameAr: "عقلة الصقور", regionId: 5, surveys: [] },
      { id: 75, nameAr: "ضريه", regionId: 5, surveys: [] }
    ]
  },
  {
    id: 6,
    nameAr: "منطقة عسير",
    governorates: [
      { id: 76, nameAr: "أبها", regionId: 6, surveys: [
        {
          id: 8,
          surveyNumber: "الأول",
          date: "2025-01-01",
          status: "completed",
          totalSamples: 800,
          positiveSamples: 15,
          negativeSamples: 785,
          prevalenceRate: ((15 / 800) * 100).toFixed(2),
          suspectedCases: 800,
          confirmedCases: 15,
          deaths: 0,
          recoveries: 12,
          livestock: {
            sheep: 1822422,
            cattle: 35987,
            horses: 0,
            camels: 57067,
            goats: 1665689
          },
          governoratesIncluded: ["أبها", "خميس مشيط", "بيشة", "النماص", "محايل عسير"]
        },
        {
          id: 24,
          surveyNumber: "الثاني",
          date: "2025-02-01",
          status: "completed",
          totalSamples: 850,
          positiveSamples: 12,
          negativeSamples: 838,
          prevalenceRate: ((12 / 850) * 100).toFixed(2),
          suspectedCases: 850,
          confirmedCases: 12,
          deaths: 0,
          recoveries: 10,
          livestock: {
            sheep: 1822422,
            cattle: 35987,
            horses: 0,
            camels: 57067,
            goats: 1665689
          },
          governoratesIncluded: ["أبها", "خميس مشيط", "بيشة", "النماص", "محايل عسير"]
        },
        {
          id: 25,
          surveyNumber: "الثالث",
          date: "2025-03-01",
          status: "ongoing",
          totalSamples: 720,
          positiveSamples: 8,
          negativeSamples: 712,
          prevalenceRate: ((8 / 720) * 100).toFixed(2),
          suspectedCases: 720,
          confirmedCases: 8,
          deaths: 0,
          recoveries: 6,
          livestock: {
            sheep: 1822422,
            cattle: 35987,
            horses: 0,
            camels: 57067,
            goats: 1665689
          },
          governoratesIncluded: ["أبها", "خميس مشيط", "بيشة", "النماص", "محايل عسير"]
        }
      ] },
      { id: 77, nameAr: "خميس مشيط", regionId: 6, surveys: [] },
      { id: 78, nameAr: "بيشة", regionId: 6, surveys: [] },
      { id: 79, nameAr: "النماص", regionId: 6, surveys: [] },
      { id: 80, nameAr: "محايل عسير", regionId: 6, surveys: [] },
      { id: 81, nameAr: "ظهران الجنوب", regionId: 6, surveys: [] },
      { id: 82, nameAr: "تثليث", regionId: 6, surveys: [] },
      { id: 83, nameAr: "سراة عبيدة", regionId: 6, surveys: [] },
      { id: 84, nameAr: "رجال ألمع", regionId: 6, surveys: [] },
      { id: 85, nameAr: "بلقرن", regionId: 6, surveys: [] },
      { id: 86, nameAr: "أحد رفيدة", regionId: 6, surveys: [] },
      { id: 87, nameAr: "المجاردة", regionId: 6, surveys: [] },
      { id: 88, nameAr: "البرك", regionId: 6, surveys: [] },
      { id: 89, nameAr: "بارق", regionId: 6, surveys: [] },
      { id: 90, nameAr: "تنومة", regionId: 6, surveys: [] },
      { id: 91, nameAr: "الحرجه", regionId: 6, surveys: [] },
      { id: 92, nameAr: "طريب", regionId: 6, surveys: [] },
      { id: 93, nameAr: "الامواه", regionId: 6, surveys: [] },
      { id: 152, nameAr: "الحريضة", regionId: 6, surveys: [] },
      { id: 153, nameAr: "قناة والبحر", regionId: 6, surveys: [] },
      { id: 154, nameAr: "السعيدة", regionId: 6, surveys: [] },
      { id: 155, nameAr: "تهامة ابها", regionId: 6, surveys: [] }
    ]
  },
  {
    id: 7,
    nameAr: "منطقة حائل",
    governorates: [
      { id: 94, nameAr: "حائل", regionId: 7, surveys: [
        {
          id: 9,
          surveyNumber: "الأول",
          date: "2025-01-01",
          status: "completed",
          totalSamples: 400,
          positiveSamples: 3,
          negativeSamples: 397,
          prevalenceRate: ((3 / 400) * 100).toFixed(2),
          suspectedCases: 400,
          confirmedCases: 3,
          deaths: 0,
          recoveries: 2,
          livestock: {
            sheep: 1170304,
            cattle: 21190,
            horses: 0,
            camels: 27292,
            goats: 266306
          },
          governoratesIncluded: ["حائل", "بقعاء", "الغزالة", "الشنان", "السليمي"]
        },
        {
          id: 24,
          surveyNumber: "الثاني",
          date: "2025-02-01",
          status: "completed",
          totalSamples: 420,
          positiveSamples: 2,
          negativeSamples: 418,
          prevalenceRate: ((2 / 420) * 100).toFixed(2),
          suspectedCases: 420,
          confirmedCases: 2,
          deaths: 0,
          recoveries: 2,
          livestock: {
            sheep: 1170304,
            cattle: 21190,
            horses: 0,
            camels: 27292,
            goats: 266306
          },
          governoratesIncluded: ["حائل", "بقعاء", "الغزالة", "الشنان", "السليمي"]
        },
        {
          id: 25,
          surveyNumber: "الثالث",
          date: "2025-03-01",
          status: "ongoing",
          totalSamples: 380,
          positiveSamples: 1,
          negativeSamples: 379,
          prevalenceRate: ((1 / 380) * 100).toFixed(2),
          suspectedCases: 380,
          confirmedCases: 1,
          deaths: 0,
          recoveries: 1,
          livestock: {
            sheep: 1170304,
            cattle: 21190,
            horses: 0,
            camels: 27292,
            goats: 266306
          },
          governoratesIncluded: ["حائل", "بقعاء", "الغزالة", "الشنان", "السليمي"]
        }
      ] },
      { id: 95, nameAr: "بقعاء", regionId: 7, surveys: [] },
      { id: 96, nameAr: "الغزالة", regionId: 7, surveys: [] },
      { id: 97, nameAr: "الشنان", regionId: 7, surveys: [] },
      { id: 98, nameAr: "الحائط", regionId: 7, surveys: [] },
      { id: 99, nameAr: "السليمي", regionId: 7, surveys: [] },
      { id: 100, nameAr: "الشملي", regionId: 7, surveys: [] },
      { id: 101, nameAr: "موقق", regionId: 7, surveys: [] },
      { id: 102, nameAr: "سميراء", regionId: 7, surveys: [] }
    ]
  },
  {
    id: 8,
    nameAr: "منطقة تبوك",
    governorates: [
      { id: 103, nameAr: "تبوك", regionId: 8, surveys: [
        {
          id: 10,
          surveyNumber: "الأول",
          date: "2025-01-01",
          status: "completed",
          totalSamples: 300,
          positiveSamples: 2,
          negativeSamples: 298,
          prevalenceRate: ((2 / 300) * 100).toFixed(2),
          suspectedCases: 300,
          confirmedCases: 2,
          deaths: 0,
          recoveries: 1,
          livestock: {
            sheep: 293958,
            cattle: 5139,
            horses: 0,
            camels: 24610,
            goats: 148765
          },
          governoratesIncluded: ["تبوك", "الوجه", "ضباء", "تيماء", "أملج"]
        },
        {
          id: 26,
          surveyNumber: "الثاني",
          date: "2025-02-01",
          status: "completed",
          totalSamples: 320,
          positiveSamples: 1,
          negativeSamples: 319,
          prevalenceRate: ((1 / 320) * 100).toFixed(2),
          suspectedCases: 320,
          confirmedCases: 1,
          deaths: 0,
          recoveries: 1,
          livestock: {
            sheep: 293958,
            cattle: 5139,
            horses: 0,
            camels: 24610,
            goats: 148765
          },
          governoratesIncluded: ["تبوك", "الوجه", "ضباء", "تيماء", "أملج"]
        },
        {
          id: 27,
          surveyNumber: "الثالث",
          date: "2025-03-01",
          status: "ongoing",
          totalSamples: 280,
          positiveSamples: 0,
          negativeSamples: 280,
          prevalenceRate: "0.00",
          suspectedCases: 280,
          confirmedCases: 0,
          deaths: 0,
          recoveries: 0,
          livestock: {
            sheep: 293958,
            cattle: 5139,
            horses: 0,
            camels: 24610,
            goats: 148765
          },
          governoratesIncluded: ["تبوك", "الوجه", "ضباء", "تيماء", "أملج"]
        }
      ] },
      { id: 104, nameAr: "الوجه", regionId: 8, surveys: [] },
      { id: 105, nameAr: "ضباء", regionId: 8, surveys: [] },
      { id: 106, nameAr: "تيماء", regionId: 8, surveys: [] },
      { id: 107, nameAr: "أملج", regionId: 8, surveys: [] },
      { id: 108, nameAr: "حقل", regionId: 8, surveys: [] },
      { id: 109, nameAr: "البدع", regionId: 8, surveys: [] }
    ]
  },
  {
    id: 9,
    nameAr: "منطقة الباحة",
    governorates: [
      { id: 110, nameAr: "الباحة", regionId: 9, surveys: [
        {
          id: 11,
          surveyNumber: "الأول",
          date: "2025-01-01",
          status: "completed",
          totalSamples: 200,
          positiveSamples: 1,
          negativeSamples: 199,
          prevalenceRate: ((1 / 200) * 100).toFixed(2),
          suspectedCases: 200,
          confirmedCases: 1,
          deaths: 0,
          recoveries: 1,
          livestock: {
            sheep: 312175,
            cattle: 5528,
            horses: 0,
            camels: 3426,
            goats: 189961
          },
          governoratesIncluded: ["الباحة", "بلجرشي", "المندق", "العقيق", "قلوة"]
        },
        {
          id: 28,
          surveyNumber: "الثاني",
          date: "2025-02-01",
          status: "completed",
          totalSamples: 220,
          positiveSamples: 0,
          negativeSamples: 220,
          prevalenceRate: "0.00",
          suspectedCases: 220,
          confirmedCases: 0,
          deaths: 0,
          recoveries: 0,
          livestock: {
            sheep: 312175,
            cattle: 5528,
            horses: 0,
            camels: 3426,
            goats: 189961
          },
          governoratesIncluded: ["الباحة", "بلجرشي", "المندق", "العقيق", "قلوة"]
        },
        {
          id: 29,
          surveyNumber: "الثالث",
          date: "2025-03-01",
          status: "ongoing",
          totalSamples: 180,
          positiveSamples: 1,
          negativeSamples: 179,
          prevalenceRate: ((1 / 180) * 100).toFixed(2),
          suspectedCases: 180,
          confirmedCases: 1,
          deaths: 0,
          recoveries: 0,
          livestock: {
            sheep: 312175,
            cattle: 5528,
            horses: 0,
            camels: 3426,
            goats: 189961
          },
          governoratesIncluded: ["الباحة", "بلجرشي", "المندق", "العقيق", "قلوة"]
        }
      ] },
      { id: 111, nameAr: "بلجرشي", regionId: 9, surveys: [] },
      { id: 112, nameAr: "المندق", regionId: 9, surveys: [] },
      { id: 113, nameAr: "المخواة", regionId: 9, surveys: [] },
      { id: 114, nameAr: "قلوة", regionId: 9, surveys: [] },
      { id: 115, nameAr: "العقيق", regionId: 9, surveys: [] },
      { id: 116, nameAr: "القرى", regionId: 9, surveys: [] },
      { id: 117, nameAr: "بني حسن", regionId: 9, surveys: [] },
      { id: 118, nameAr: "غامد الزناد", regionId: 9, surveys: [] },
      { id: 119, nameAr: "الحجرة", regionId: 9, surveys: [] }
    ]
  },
  {
    id: 10,
    nameAr: "منطقة الحدود الشمالية",
    governorates: [
      { id: 120, nameAr: "عرعر", regionId: 10, surveys: [
        {
          id: 12,
          surveyNumber: "الأول",
          date: "2025-01-01",
          status: "completed",
          totalSamples: 250,
          positiveSamples: 1,
          negativeSamples: 249,
          prevalenceRate: ((1 / 250) * 100).toFixed(2),
          suspectedCases: 250,
          confirmedCases: 1,
          deaths: 0,
          recoveries: 1,
          livestock: {
            sheep: 1296203,
            cattle: 50,
            horses: 0,
            camels: 8751,
            goats: 56988
          },
          governoratesIncluded: ["عرعر", "رفحاء", "طريف", "العويقلية"]
        },
        {
          id: 30,
          surveyNumber: "الثاني",
          date: "2025-02-01",
          status: "completed",
          totalSamples: 270,
          positiveSamples: 0,
          negativeSamples: 270,
          prevalenceRate: "0.00",
          suspectedCases: 270,
          confirmedCases: 0,
          deaths: 0,
          recoveries: 0,
          livestock: {
            sheep: 1296203,
            cattle: 50,
            horses: 0,
            camels: 8751,
            goats: 56988
          },
          governoratesIncluded: ["عرعر", "رفحاء", "طريف", "العويقلية"]
        },
        {
          id: 31,
          surveyNumber: "الثالث",
          date: "2025-03-01",
          status: "ongoing",
          totalSamples: 230,
          positiveSamples: 1,
          negativeSamples: 229,
          prevalenceRate: ((1 / 230) * 100).toFixed(2),
          suspectedCases: 230,
          confirmedCases: 1,
          deaths: 0,
          recoveries: 0,
          livestock: {
            sheep: 1296203,
            cattle: 50,
            horses: 0,
            camels: 8751,
            goats: 56988
          },
          governoratesIncluded: ["عرعر", "رفحاء", "طريف", "العويقلية"]
        }
      ] },
      { id: 121, nameAr: "رفحاء", regionId: 10, surveys: [] },
      { id: 122, nameAr: "طريف", regionId: 10, surveys: [] },
      { id: 123, nameAr: "العويقلية", regionId: 10, surveys: [] }
    ]
  },
  {
    id: 11,
    nameAr: "منطقة الجوف",
    governorates: [
      { id: 124, nameAr: "سكاكا", regionId: 11, surveys: [
        {
          id: 13,
          surveyNumber: "الأول",
          date: "2025-01-01",
          status: "completed",
          totalSamples: 350,
          positiveSamples: 4,
          negativeSamples: 346,
          prevalenceRate: ((4 / 350) * 100).toFixed(2),
          suspectedCases: 350,
          confirmedCases: 4,
          deaths: 0,
          recoveries: 3,
          livestock: {
            sheep: 3954866,
            cattle: 2024,
            horses: 0,
            camels: 19891,
            goats: 98109
          },
          governoratesIncluded: ["سكاكا", "القريات", "دومة الجندل", "طبرجل"]
        },
        {
          id: 32,
          surveyNumber: "الثاني",
          date: "2025-02-01",
          status: "completed",
          totalSamples: 380,
          positiveSamples: 2,
          negativeSamples: 378,
          prevalenceRate: ((2 / 380) * 100).toFixed(2),
          suspectedCases: 380,
          confirmedCases: 2,
          deaths: 0,
          recoveries: 2,
          livestock: {
            sheep: 3954866,
            cattle: 2024,
            horses: 0,
            camels: 19891,
            goats: 98109
          },
          governoratesIncluded: ["سكاكا", "القريات", "دومة الجندل", "طبرجل"]
        },
        {
          id: 33,
          surveyNumber: "الثالث",
          date: "2025-03-01",
          status: "ongoing",
          totalSamples: 320,
          positiveSamples: 3,
          negativeSamples: 317,
          prevalenceRate: ((3 / 320) * 100).toFixed(2),
          suspectedCases: 320,
          confirmedCases: 3,
          deaths: 0,
          recoveries: 1,
          livestock: {
            sheep: 3954866,
            cattle: 2024,
            horses: 0,
            camels: 19891,
            goats: 98109
          },
          governoratesIncluded: ["سكاكا", "القريات", "دومة الجندل", "طبرجل"]
        }
      ] },
      { id: 125, nameAr: "القريات", regionId: 11, surveys: [] },
      { id: 126, nameAr: "دومة الجندل", regionId: 11, surveys: [] },
      { id: 127, nameAr: "طبرجل", regionId: 11, surveys: [] }
    ]
  },
  {
    id: 12,
    nameAr: "منطقة جازان",
    governorates: [
      { id: 128, nameAr: "جازان", regionId: 12, surveys: [
        {
          id: 14,
          surveyNumber: "الأول",
          date: "2025-01-01",
          status: "completed",
          totalSamples: 100,
          positiveSamples: 0,
          negativeSamples: 100,
          prevalenceRate: "0.00",
          suspectedCases: 100,
          confirmedCases: 0,
          deaths: 0,
          recoveries: 0,
          livestock: {
            sheep: 0,
            cattle: 0,
            horses: 0,
            camels: 0,
            goats: 0
          },
          governoratesIncluded: ["جازان", "صبيا", "أبو عريش", "صامطة", "الدرب"]
        },
        {
          id: 34,
          surveyNumber: "الثاني",
          date: "2025-02-01",
          status: "completed",
          totalSamples: 120,
          positiveSamples: 0,
          negativeSamples: 120,
          prevalenceRate: "0.00",
          suspectedCases: 120,
          confirmedCases: 0,
          deaths: 0,
          recoveries: 0,
          livestock: {
            sheep: 0,
            cattle: 0,
            horses: 0,
            camels: 0,
            goats: 0
          },
          governoratesIncluded: ["جازان", "صبيا", "أبو عريش", "صامطة", "الدرب"]
        },
        {
          id: 35,
          surveyNumber: "الثالث",
          date: "2025-03-01",
          status: "ongoing",
          totalSamples: 80,
          positiveSamples: 0,
          negativeSamples: 80,
          prevalenceRate: "0.00",
          suspectedCases: 80,
          confirmedCases: 0,
          deaths: 0,
          recoveries: 0,
          livestock: {
            sheep: 0,
            cattle: 0,
            horses: 0,
            camels: 0,
            goats: 0
          },
          governoratesIncluded: ["جازان", "صبيا", "أبو عريش", "صامطة", "الدرب"]
        }
      ] },
      { id: 129, nameAr: "صبيا", regionId: 12, surveys: [] },
      { id: 130, nameAr: "أبو عريش", regionId: 12, surveys: [] },
      { id: 131, nameAr: "صامطة", regionId: 12, surveys: [] },
      { id: 132, nameAr: "الدرب", regionId: 12, surveys: [] },
      { id: 133, nameAr: "بيش", regionId: 12, surveys: [] },
      { id: 134, nameAr: "الحرث", regionId: 12, surveys: [] },
      { id: 135, nameAr: "ضمد", regionId: 12, surveys: [] },
      { id: 136, nameAr: "الريث", regionId: 12, surveys: [] },
      { id: 137, nameAr: "جزر فرسان", regionId: 12, surveys: [] },
      { id: 138, nameAr: "الدائر", regionId: 12, surveys: [] },
      { id: 139, nameAr: "أحد المسارحة", regionId: 12, surveys: [] },
      { id: 140, nameAr: "العيدابي", regionId: 12, surveys: [] },
      { id: 141, nameAr: "العارضة", regionId: 12, surveys: [] },
      { id: 142, nameAr: "فيفا", regionId: 12, surveys: [] },
      { id: 143, nameAr: "الطوال", regionId: 12, surveys: [] },
      { id: 144, nameAr: "هروب", regionId: 12, surveys: [] }
    ]
  },
  {
    id: 13,
    nameAr: "منطقة نجران",
    governorates: [
      { id: 145, nameAr: "نجران", regionId: 13, surveys: [
        {
          id: 15,
          surveyNumber: "الأول",
          date: "2025-01-01",
          status: "completed",
          totalSamples: 450,
          positiveSamples: 7,
          negativeSamples: 443,
          prevalenceRate: ((7 / 450) * 100).toFixed(2),
          suspectedCases: 450,
          confirmedCases: 7,
          deaths: 0,
          recoveries: 5,
          livestock: {
            sheep: 1927448,
            cattle: 4934,
            horses: 0,
            camels: 22337,
            goats: 1186775
          },
          governoratesIncluded: ["نجران", "شرورة", "حبونا", "بدر الجنوب", "يدمة"]
        },
        {
          id: 36,
          surveyNumber: "الثاني",
          date: "2025-02-01",
          status: "completed",
          totalSamples: 480,
          positiveSamples: 4,
          negativeSamples: 476,
          prevalenceRate: ((4 / 480) * 100).toFixed(2),
          suspectedCases: 480,
          confirmedCases: 4,
          deaths: 0,
          recoveries: 4,
          livestock: {
            sheep: 1927448,
            cattle: 4934,
            horses: 0,
            camels: 22337,
            goats: 1186775
          },
          governoratesIncluded: ["نجران", "شرورة", "حبونا", "بدر الجنوب", "يدمة"]
        },
        {
          id: 37,
          surveyNumber: "الثالث",
          date: "2025-03-01",
          status: "ongoing",
          totalSamples: 420,
          positiveSamples: 5,
          negativeSamples: 415,
          prevalenceRate: ((5 / 420) * 100).toFixed(2),
          suspectedCases: 420,
          confirmedCases: 5,
          deaths: 0,
          recoveries: 2,
          livestock: {
            sheep: 1927448,
            cattle: 4934,
            horses: 0,
            camels: 22337,
            goats: 1186775
          },
          governoratesIncluded: ["نجران", "شرورة", "حبونا", "بدر الجنوب", "يدمة"]
        }
      ] },
      { id: 146, nameAr: "شرورة", regionId: 13, surveys: [] },
      { id: 147, nameAr: "حبونا", regionId: 13, surveys: [] },
      { id: 148, nameAr: "بدر الجنوب", regionId: 13, surveys: [] },
      { id: 149, nameAr: "يدمة", regionId: 13, surveys: [] },
      { id: 150, nameAr: "ثار", regionId: 13, surveys: [] },
      { id: 151, nameAr: "خباش", regionId: 13, surveys: [] }
    ]
  }
]

// بيانات المسوحات القديمة للمقارنة
const mockSurveys = [
  {
    id: 1,
    disease: "حمى الوادي المتصدع",
    governorate: "الرياض",
    surveyDate: "2024-01-15",
    status: "completed",
    totalSamples: 150,
    positiveSamples: 3,
  },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [diseases, setDiseases] = useState(mockDiseases)
  const [surveys, setSurveys] = useState(mockSurveys)
  const [regions, setRegions] = useState(mockRegions)
  const [selectedDisease, setSelectedDisease] = useState("حمى الوادي المتصدع")
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)
  const [selectedGovernorate, setSelectedGovernorate] = useState<number | null>(null)
  const [selectedLivestockRegion, setSelectedLivestockRegion] = useState<number | null>(null)
  const [isGlobalHealthUpdatesEnabled, setIsGlobalHealthUpdatesEnabled] = useState<boolean>(true)
  const [mapSettings, setMapSettings] = useState({
    isEnabled: true,
    showPopulation: true,
    showCities: true,
    showDistricts: true,
    enableSearch: true,
    enableDownload: true,
    defaultZoom: 6,
    showLegend: true,
    colorScheme: 'population', // 'population', 'risk', 'custom'
    enableRegionSelection: true,
    showStatistics: true
  })
  const [interfaceSettings, setInterfaceSettings] = useState({
    showHeader: true,
    showHeroSection: true,
    showStatsSection: true,
    showRecentUpdatesSection: true,
    showFeaturesSection: true,
    showFooter: true,
    heroTitle: "منصة مناح",
    heroSubtitle: "نظام مراقبة الأمراض الحيوانية",
    heroDescription: "منصة متقدمة لمراقبة ومتابعة الأمراض الحيوانية في المملكة العربية السعودية",
    recentUpdatesTitle: "آخر التحديثات",
    recentUpdatesDescription: "تابع أحدث المسوحات والتطورات في مراقبة الأمراض الحيوانية",
    featuresTitle: "الميزات الرئيسية",
    featuresDescription: "اكتشف الأدوات والميزات المتقدمة لمراقبة الأمراض الحيوانية",
    maxRecentSurveys: 3
  })
  const [editingSurvey, setEditingSurvey] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [selectedMapPath, setSelectedMapPath] = useState<string | null>(null)
  const [isAllMapsModalOpen, setIsAllMapsModalOpen] = useState(false)
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null)
  const [isSurveyDetailModalOpen, setIsSurveyDetailModalOpen] = useState(false)
  const [isAddSurveyDialogOpen, setIsAddSurveyDialogOpen] = useState(false)
  const [selectedRegionForLivestock, setSelectedRegionForLivestock] = useState<number | null>(null)
  const [newSurveyData, setNewSurveyData] = useState({
    startDate: '',
    endDate: '',
    status: 'planned' as 'planned' | 'in_progress' | 'completed',
    totalSamples: 864,
    positiveSamples: 12,
    livestock: {
      sheep: 0,
      cattle: 0,
      horses: 0,
      camels: 0,
      goats: 0
    }
  })

  // تحميل البيانات من localStorage عند بدء التشغيل
  useEffect(() => {
    const savedRegions = localStorage.getItem('manaah-regions')
    const savedDiseases = localStorage.getItem('manaah-diseases')
    const savedSurveys = localStorage.getItem('manaah-surveys')
    const savedGlobalHealthUpdatesEnabled = localStorage.getItem('manaah-globalHealthUpdatesEnabled')
    
    if (savedRegions) {
      try {
        setRegions(JSON.parse(savedRegions))
      } catch (error) {
        console.error('خطأ في تحميل بيانات المناطق:', error)
      }
    }
    
    if (savedDiseases) {
      try {
        setDiseases(JSON.parse(savedDiseases))
      } catch (error) {
        console.error('خطأ في تحميل بيانات الأمراض:', error)
      }
    }
    
    if (savedSurveys) {
      try {
        setSurveys(JSON.parse(savedSurveys))
      } catch (error) {
        console.error('خطأ في تحميل بيانات المسوحات:', error)
      }
    }
    
    if (savedGlobalHealthUpdatesEnabled !== null) {
      try {
        setIsGlobalHealthUpdatesEnabled(JSON.parse(savedGlobalHealthUpdatesEnabled))
      } catch (error) {
        console.error('خطأ في تحميل إعدادات التحديثات العامة:', error)
      }
    }
    
    const savedMapSettings = localStorage.getItem('manaah-mapSettings')
    if (savedMapSettings !== null) {
      try {
        setMapSettings(JSON.parse(savedMapSettings))
      } catch (error) {
        console.error('خطأ في تحميل إعدادات الخريطة:', error)
      }
    }
    
    const savedInterfaceSettings = localStorage.getItem('manaah-interfaceSettings')
    if (savedInterfaceSettings !== null) {
      try {
        setInterfaceSettings(JSON.parse(savedInterfaceSettings))
      } catch (error) {
        console.error('خطأ في تحميل إعدادات الواجهة:', error)
      }
    }
  }, [])

  // حفظ البيانات في localStorage عند التغيير
  useEffect(() => {
    localStorage.setItem('manaah-regions', JSON.stringify(regions))
  }, [regions])

  useEffect(() => {
    localStorage.setItem('manaah-diseases', JSON.stringify(diseases))
  }, [diseases])

  useEffect(() => {
    localStorage.setItem('manaah-surveys', JSON.stringify(surveys))
  }, [surveys])

  useEffect(() => {
    localStorage.setItem('manaah-globalHealthUpdatesEnabled', JSON.stringify(isGlobalHealthUpdatesEnabled))
  }, [isGlobalHealthUpdatesEnabled])

  useEffect(() => {
    localStorage.setItem('manaah-mapSettings', JSON.stringify(mapSettings))
  }, [mapSettings])

  useEffect(() => {
    localStorage.setItem('manaah-interfaceSettings', JSON.stringify(interfaceSettings))
  }, [interfaceSettings])

  // دالة إعادة تعيين البيانات للقيم الافتراضية
  const resetToDefaults = () => {
    setRegions(mockRegions)
    setDiseases(mockDiseases)
    setSurveys(mockSurveys)
    localStorage.removeItem('manaah-regions')
    localStorage.removeItem('manaah-diseases')
    localStorage.removeItem('manaah-surveys')
  }

  // حساب إجمالي الماشية من جميع المسوحات
  const calculateTotalLivestock = () => {
    const totals = {
      sheep: 0,
      cattle: 0,
      horses: 0,
      camels: 0,
      goats: 0
    }

    regions.forEach(region => {
      region.governorates.forEach(gov => {
        gov.surveys.forEach(survey => {
          if (survey.livestock) {
            totals.sheep += survey.livestock.sheep || 0
            totals.cattle += survey.livestock.cattle || 0
            totals.horses += survey.livestock.horses || 0
            totals.camels += survey.livestock.camels || 0
            totals.goats += survey.livestock.goats || 0
          }
        })
      })
    })

    return totals
  }

  const totalLivestock = calculateTotalLivestock()

  // حساب إجمالي المسوحات والعينات
  const totalSurveys = regions.reduce((total, region) => 
    total + region.governorates.reduce((govTotal, gov) => 
      govTotal + gov.surveys.length, 0), 0)

  const totalSamples = regions.reduce((total, region) => 
    total + region.governorates.reduce((govTotal, gov) => 
      govTotal + gov.surveys.reduce((surveyTotal, survey) => 
        surveyTotal + (survey.totalSamples || 0), 0), 0), 0)

  const totalPositiveSamples = regions.reduce((total, region) => 
    total + region.governorates.reduce((govTotal, gov) => 
      govTotal + gov.surveys.reduce((surveyTotal, survey) => 
        surveyTotal + (survey.positiveSamples || 0), 0), 0), 0)

  const overallPrevalenceRate = totalSamples > 0 ? ((totalPositiveSamples / totalSamples) * 100).toFixed(2) : "0.00"

  // دالة إضافة مسح جديد
  const handleAddSurvey = () => {
    if (!selectedRegion || !selectedGovernorate || !newSurveyData.startDate) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    const newSurvey = {
      id: Date.now(),
      surveyNumber: `المسح ${Date.now()}`,
      date: newSurveyData.startDate,
      endDate: newSurveyData.endDate || null,
      status: newSurveyData.status,
      totalSamples: newSurveyData.totalSamples,
      positiveSamples: newSurveyData.positiveSamples,
      negativeSamples: newSurveyData.totalSamples - newSurveyData.positiveSamples,
      prevalenceRate: ((newSurveyData.positiveSamples / newSurveyData.totalSamples) * 100).toFixed(2),
      suspectedCases: newSurveyData.totalSamples,
      confirmedCases: newSurveyData.positiveSamples,
      deaths: 0,
      recoveries: Math.max(0, newSurveyData.positiveSamples - 1),
      livestock: newSurveyData.livestock,
      governoratesIncluded: [regions.find(r => r.id === selectedRegion)?.governorates.find(g => g.id === selectedGovernorate)?.nameAr || ""]
    }

    const updatedRegions = regions.map(region => {
      if (region.id === selectedRegion) {
        return {
          ...region,
          governorates: region.governorates.map(gov => {
            if (gov.id === selectedGovernorate) {
              return {
                ...gov,
                surveys: [...gov.surveys, newSurvey]
              }
            }
            return gov
          })
        }
      }
      return region
    })

    setRegions(updatedRegions)
    setIsAddSurveyDialogOpen(false)
    setNewSurveyData({
      startDate: '',
      endDate: '',
      status: 'planned',
      totalSamples: 864,
      positiveSamples: 12,
      livestock: {
        sheep: 0,
        cattle: 0,
        horses: 0,
        camels: 0,
        goats: 0
      }
    })
    alert('تم إضافة المسح بنجاح!')
  }

  // دالة حذف مسح
  const handleDeleteSurvey = (regionId: number, governorateId: number, surveyId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المسح؟')) {
      return
    }

    const updatedRegions = regions.map(region => {
      if (region.id === regionId) {
        return {
          ...region,
          governorates: region.governorates.map(gov => {
            if (gov.id === governorateId) {
              return {
                ...gov,
                surveys: gov.surveys.filter(survey => survey.id !== surveyId)
              }
            }
            return gov
          })
        }
      }
      return region
    })

    setRegions(updatedRegions)
    alert('تم حذف المسح بنجاح!')
  }

  // دالة تحديث مسح
  const handleUpdateSurvey = (updatedSurvey: any) => {
    const updatedRegions = regions.map(region => ({
      ...region,
      governorates: region.governorates.map(gov => ({
        ...gov,
        surveys: gov.surveys.map(survey => 
          survey.id === updatedSurvey.id ? updatedSurvey : survey
        )
      }))
    }))

    setRegions(updatedRegions)
    setEditingSurvey(null)
    setIsEditDialogOpen(false)
    alert('تم تحديث المسح بنجاح!')
  }

  // دالة فتح الخريطة
  const handleOpenMap = (regionName: string) => {
    const mapPaths: { [key: string]: string } = {
      "منطقة الرياض": "/المملكة والمناطق/منطقة الرياض.svg",
      "منطقة مكة المكرمة": "/المملكة والمناطق/مكة المكرمة.svg",
      "منطقة المدينة المنورة": "/المملكة والمناطق/المدينة المنورة.svg",
      "المنطقة الشرقية": "/المملكة والمناطق/المنطقة الشرقية.svg",
      "منطقة القصيم": "/المملكة والمناطق/القصيم.svg",
      "منطقة عسير": "/المملكة والمناطق/عسير.svg",
      "منطقة حائل": "/المملكة والمناطق/حائل.svg",
      "منطقة تبوك": "/المملكة والمناطق/تبوك.svg",
      "منطقة الباحة": "/المملكة والمناطق/الباحة.svg",
      "منطقة الحدود الشمالية": "/المملكة والمناطق/الحدود الشمالية.svg",
      "منطقة الجوف": "/المملكة والمناطق/الجوف.svg",
      "منطقة جازان": "/المملكة والمناطق/منطقة جازان.svg",
      "منطقة نجران": "/المملكة والمناطق/نجران.svg"
    }
    
    const mapPath = mapPaths[regionName]
    if (mapPath) {
      setSelectedMapPath(mapPath)
      setIsMapModalOpen(true)
    } else {
      alert('خريطة هذه المنطقة غير متوفرة حالياً')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 rtl">
      {/* شريط التنقل العلوي */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600 ml-3" />
              <span className="text-xl font-bold text-gray-900">منصة مناح</span>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-sm text-gray-700">مرحباً، {mockUser.fullName}</span>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4 ml-2" />
                  تسجيل الخروج
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* علامات التبويب */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 space-x-reverse">
              {[
                { id: "overview", label: "نظرة عامة", icon: Shield },
                { id: "surveys", label: "المسوحات", icon: FileText },
                { id: "livestock", label: "الثروة الحيوانية", icon: Shield },
                { id: "epidemiological", label: "الأحزمة الوبائية", icon: Map },
                { id: "settings", label: "الإعدادات", icon: Shield }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <Icon className="h-4 w-4 ml-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* محتوى علامة التبويب النشطة */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="إجمالي المسوحات"
                value={totalSurveys}
                icon={FileText}
                trend={{ value: 12, isPositive: true }}
              />
              <StatsCard
                title="إجمالي العينات"
                value={totalSamples.toLocaleString()}
                icon={Shield}
                trend={{ value: 8, isPositive: true }}
              />
              <StatsCard
                title="معدل الانتشار"
                value={`${overallPrevalenceRate}%`}
                icon={AlertTriangle}
                trend={{ value: 2, isPositive: false }}
              />
              <StatsCard
                title="المناطق المشمولة"
                value={regions.filter(region => 
                  region.governorates.some(gov => gov.surveys.length > 0)
                ).length}
                icon={Map}
                trend={{ value: 15, isPositive: true }}
              />
            </div>
          )}

          {activeTab === "surveys" && (
            <div className="space-y-6">
              {/* أزرار التحكم */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">إدارة المسوحات الوبائية</h2>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setIsAllMapsModalOpen(true)}
                    variant="outline"
                  >
                    <Map className="h-4 w-4 ml-2" />
                    عرض جميع الخرائط
                  </Button>
                  <Button 
                    onClick={() => setIsAddSurveyDialogOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة مسح جديد
                  </Button>
                </div>
              </div>

              {/* فلاتر */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg shadow">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المرض</label>
                  <select 
                    value={selectedDisease}
                    onChange={(e) => setSelectedDisease(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {diseases.map((disease) => (
                      <option key={disease.id} value={disease.nameAr}>
                        {disease.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المنطقة</label>
                  <select 
                    value={selectedRegion || ''}
                    onChange={(e) => {
                      const regionId = e.target.value ? parseInt(e.target.value) : null
                      setSelectedRegion(regionId)
                      setSelectedGovernorate(null)
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">جميع المناطق</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">المحافظة</label>
                   <select 
                     value={selectedGovernorate || ''}
                     onChange={(e) => setSelectedGovernorate(e.target.value ? parseInt(e.target.value) : null)}
                     className="w-full p-2 border border-gray-300 rounded-md"
                   >
                     <option value="">جميع المحافظات</option>
                     {selectedRegion && regions.find(r => r.id === selectedRegion)?.governorates.map((gov) => (
                       <option key={gov.id} value={gov.id}>
                         {gov.nameAr}
                       </option>
                     ))}
                   </select>
                 </div>
               </div>

               {/* عرض المسوحات */}
               <div className="space-y-6">
                 {regions.map((region) => {
                   if (selectedRegion && region.id !== selectedRegion) return null
                   
                   return region.governorates.map((governorate) => {
                     if (selectedGovernorate && governorate.id !== selectedGovernorate) return null
                     if (governorate.surveys.length === 0) return null
                     
                     return (
                       <Card key={`${region.id}-${governorate.id}`} className="bg-white shadow-lg">
                         <CardHeader>
                           <div className="flex justify-between items-center">
                             <div>
                               <CardTitle className="text-xl text-gray-900">
                                 مسوحات {governorate.nameAr} - {region.nameAr}
                               </CardTitle>
                               <CardDescription className="text-gray-600">
                                 {governorate.surveys.length} مسح منجز
                               </CardDescription>
                             </div>
                             <Button 
                               onClick={() => handleOpenMap(region.nameAr)}
                               variant="outline"
                               size="sm"
                             >
                               <Map className="h-4 w-4 ml-2" />
                               عرض الخريطة
                             </Button>
                           </div>
                         </CardHeader>
                         <CardContent>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {governorate.surveys.map((survey) => (
                               <Card key={survey.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                                 <CardHeader className="pb-3">
                                   <div className="flex justify-between items-start">
                                     <CardTitle className="text-lg text-gray-800">
                                       المسح {survey.surveyNumber}
                                     </CardTitle>
                                     <Badge
                                       className={
                                         survey.status === "completed"
                                           ? "bg-green-100 text-green-800"
                                           : survey.status === "in_progress"
                                           ? "bg-yellow-100 text-yellow-800"
                                           : "bg-gray-100 text-gray-800"
                                       }
                                     >
                                       {survey.status === "completed"
                                         ? "مكتمل"
                                         : survey.status === "in_progress"
                                         ? "قيد التنفيذ"
                                         : "مخطط"}
                                     </Badge>
                                   </div>
                                   <CardDescription className="text-sm text-gray-600">
                                     {new Date(survey.date).toLocaleDateString("ar-SA")}
                                   </CardDescription>
                                 </CardHeader>
                                 <CardContent className="space-y-4">
                                   <div className="grid grid-cols-2 gap-4 text-sm">
                                     <div className="bg-blue-50 p-3 rounded-lg">
                                       <div className="text-blue-600 font-medium">إجمالي العينات</div>
                                       <div className="text-2xl font-bold text-blue-800">
                                         {survey.totalSamples.toLocaleString()}
                                       </div>
                                     </div>
                                     <div className="bg-red-50 p-3 rounded-lg">
                                       <div className="text-red-600 font-medium">العينات الإيجابية</div>
                                       <div className="text-2xl font-bold text-red-800">
                                         {survey.positiveSamples}
                                       </div>
                                     </div>
                                     <div className="bg-green-50 p-3 rounded-lg">
                                       <div className="text-green-600 font-medium">العينات السلبية</div>
                                       <div className="text-2xl font-bold text-green-800">
                                         {survey.negativeSamples}
                                       </div>
                                     </div>
                                     <div className="bg-purple-50 p-3 rounded-lg">
                                       <div className="text-purple-600 font-medium">نسبة الانتشار</div>
                                       <div className="text-2xl font-bold text-purple-800">
                                         {survey.prevalenceRate}%
                                       </div>
                                     </div>
                                   </div>
                                   
                                   {/* أزرار الإجراءات */}
                                   <div className="flex gap-2 pt-4 border-t">
                                     <Button 
                                       variant="outline" 
                                       size="sm" 
                                       className="flex-1"
                                       onClick={() => {
                                         setSelectedSurvey(survey)
                                         setIsSurveyDetailModalOpen(true)
                                       }}
                                     >
                                       <Eye className="h-4 w-4 ml-2" />
                                       عرض
                                     </Button>
                                     <Button 
                                       variant="outline" 
                                       size="sm" 
                                       className="flex-1"
                                       onClick={() => {
                                         setEditingSurvey(survey)
                                         setIsEditDialogOpen(true)
                                       }}
                                     >
                                       <Edit className="h-4 w-4 ml-2" />
                                       تعديل
                                     </Button>
                                     <Button 
                                       variant="outline" 
                                       size="sm" 
                                       className="flex-1 text-red-600 hover:text-red-700"
                                       onClick={() => handleDeleteSurvey(region.id, governorate.id, survey.id)}
                                     >
                                       <Trash2 className="h-4 w-4 ml-2" />
                                       حذف
                                     </Button>
                                   </div>
                                 </CardContent>
                               </Card>
                             ))}
                           </div>
                         </CardContent>
                       </Card>
                     )
                   })
                 })}
               </div>
             </div>
           )}

           {activeTab === "livestock" && (
             <div className="space-y-6">
               <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-gray-900">إحصائيات الثروة الحيوانية</h2>
                 <div className="flex items-center gap-4">
                   <label className="text-sm font-medium text-gray-700">اختر المنطقة:</label>
                   <select 
                     value={selectedLivestockRegion || ""} 
                     onChange={(e) => setSelectedLivestockRegion(e.target.value ? parseInt(e.target.value) : null)}
                     className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                   >
                     <option value="">جميع المناطق</option>
                     {regions.filter(region => 
                       region.governorates.some(gov => gov.surveys.length > 0)
                     ).map(region => (
                       <option key={region.id} value={region.id}>{region.nameAr}</option>
                     ))}
                   </select>
                 </div>
               </div>

               {/* إجمالي الثروة الحيوانية */}
               <Card className="bg-white shadow-lg">
                 <CardHeader>
                   <CardTitle className="text-xl text-gray-900">
                     {selectedLivestockRegion 
                       ? `إجمالي الثروة الحيوانية في ${regions.find(r => r.id === selectedLivestockRegion)?.nameAr}`
                       : "إجمالي الثروة الحيوانية في المملكة"
                     }
                   </CardTitle>
                   <CardDescription className="text-gray-600">
                     البيانات مجمعة من جميع المسوحات المنجزة
                     {selectedLivestockRegion && ` في ${regions.find(r => r.id === selectedLivestockRegion)?.nameAr}`}
                   </CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                     {(() => {
                       const filteredRegions = selectedLivestockRegion 
                         ? regions.filter(region => region.id === selectedLivestockRegion)
                         : regions
                       
                       const regionLivestock = filteredRegions.reduce((totals, region) => {
                         region.governorates.forEach(gov => {
                           gov.surveys.forEach(survey => {
                             if (survey.livestock) {
                               totals.sheep += survey.livestock.sheep || 0
                               totals.cattle += survey.livestock.cattle || 0
                               totals.horses += survey.livestock.horses || 0
                               totals.camels += survey.livestock.camels || 0
                               totals.goats += survey.livestock.goats || 0
                             }
                           })
                         })
                         return totals
                       }, { sheep: 0, cattle: 0, horses: 0, camels: 0, goats: 0 })
                       
                       return (
                         <>
                           <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                             <div className="text-3xl font-bold text-blue-700 mb-2">
                               {regionLivestock.sheep.toLocaleString()}
                             </div>
                             <div className="text-sm font-medium text-blue-600">أغنام</div>
                           </div>
                           <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                             <div className="text-3xl font-bold text-green-700 mb-2">
                               {regionLivestock.goats.toLocaleString()}
                             </div>
                             <div className="text-sm font-medium text-green-600">ماعز</div>
                           </div>
                           <div className="text-center p-6 bg-orange-50 rounded-xl border border-orange-200">
                             <div className="text-3xl font-bold text-orange-700 mb-2">
                               {regionLivestock.cattle.toLocaleString()}
                             </div>
                             <div className="text-sm font-medium text-orange-600">أبقار</div>
                           </div>
                           <div className="text-center p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                             <div className="text-3xl font-bold text-yellow-700 mb-2">
                               {regionLivestock.camels.toLocaleString()}
                             </div>
                             <div className="text-sm font-medium text-yellow-600">إبل</div>
                           </div>
                           <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                             <div className="text-3xl font-bold text-purple-700 mb-2">
                               {regionLivestock.horses.toLocaleString()}
                             </div>
                             <div className="text-sm font-medium text-purple-600">خيل</div>
                           </div>
                         </>
                       )
                     })()} 
                   </div>
                 </CardContent>
               </Card>

               {/* تفصيل حسب المناطق */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {regions.filter(region => 
                   region.governorates.some(gov => gov.surveys.length > 0) &&
                   (selectedLivestockRegion === null || region.id === selectedLivestockRegion)
                 ).map((region) => {
                   const regionLivestock = region.governorates.reduce((totals, gov) => {
                     gov.surveys.forEach(survey => {
                       if (survey.livestock) {
                         totals.sheep += survey.livestock.sheep || 0
                         totals.cattle += survey.livestock.cattle || 0
                         totals.horses += survey.livestock.horses || 0
                         totals.camels += survey.livestock.camels || 0
                         totals.goats += survey.livestock.goats || 0
                       }
                     })
                     return totals
                   }, { sheep: 0, cattle: 0, horses: 0, camels: 0, goats: 0 })

                   return (
                     <Card key={region.id} className="bg-white shadow-lg">
                       <CardHeader>
                         <CardTitle className="text-lg text-gray-900">{region.nameAr}</CardTitle>
                         <CardDescription className="text-gray-600">
                           {region.governorates.filter(gov => gov.surveys.length > 0).length} محافظة مشمولة
                         </CardDescription>
                       </CardHeader>
                       <CardContent>
                         <div className="grid grid-cols-2 gap-4 text-sm">
                           <div className="bg-blue-50 p-3 rounded-lg">
                             <div className="text-blue-600 font-medium">أغنام</div>
                             <div className="text-xl font-bold text-blue-800">
                               {regionLivestock.sheep.toLocaleString()}
                             </div>
                           </div>
                           <div className="bg-green-50 p-3 rounded-lg">
                             <div className="text-green-600 font-medium">ماعز</div>
                             <div className="text-xl font-bold text-green-800">
                               {regionLivestock.goats.toLocaleString()}
                             </div>
                           </div>
                           <div className="bg-orange-50 p-3 rounded-lg">
                             <div className="text-orange-600 font-medium">أبقار</div>
                             <div className="text-xl font-bold text-orange-800">
                               {regionLivestock.cattle.toLocaleString()}
                             </div>
                           </div>
                           <div className="bg-yellow-50 p-3 rounded-lg">
                             <div className="text-yellow-600 font-medium">إبل</div>
                             <div className="text-xl font-bold text-yellow-800">
                               {regionLivestock.camels.toLocaleString()}
                             </div>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   )
                 })}
               </div>
             </div>
           )}

           {activeTab === "epidemiological" && (
             <div className="space-y-6">
               <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-gray-900">الأحزمة الوبائية</h2>
                 <p className="text-gray-600">تصنيف المحافظات حسب مستوى المخاطر الوبائية</p>
               </div>

               <div className="grid gap-6">
                 {Object.values(epidemiologicalBelts).map((belt) => (
                   <Card key={belt.id} className="border-l-4" style={{ borderLeftColor: belt.color }}>
                     <CardHeader>
                       <div className="flex items-center gap-3">
                         <div 
                           className="w-4 h-4 rounded-full" 
                           style={{ backgroundColor: belt.color }}
                         ></div>
                         <CardTitle className="text-xl">{belt.nameAr}</CardTitle>
                         <Badge 
                           variant="outline" 
                           className="text-xs"
                           style={{ 
                             borderColor: belt.color, 
                             color: belt.color,
                             backgroundColor: `${belt.color}10`
                           }}
                         >
                           {belt.riskLevel}
                         </Badge>
                       </div>
                       <CardDescription className="text-sm leading-relaxed">
                         {belt.description}
                       </CardDescription>
                     </CardHeader>
                     <CardContent>
                       {belt.id === 'green' ? (
                         <div className="text-sm text-gray-600">
                           يشمل جميع المحافظات الأخرى غير المذكورة في الأحزمة السابقة
                         </div>
                       ) : (
                         <div className="space-y-4">
                           <div className="flex items-center gap-2">
                             <span className="text-sm font-medium">عدد المحافظات:</span>
                             <Badge variant="secondary">{belt.governorates.length}</Badge>
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                             {belt.governorates.map((govName, index) => (
                               <div 
                                 key={index}
                                 className="text-xs p-2 rounded bg-gray-50 text-center border"
                               >
                                 {govName}
                               </div>
                             ))}
                           </div>
                         </div>
                       )}
                     </CardContent>
                   </Card>
                 ))}
               </div>
             </div>
           )}

           {activeTab === "settings" && (
             <div className="space-y-6">
               <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-gray-900">إعدادات النظام</h2>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                   <CardHeader>
                     <CardTitle>معلومات الحساب</CardTitle>
                     <CardDescription>بيانات المستخدم الحالي</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div>
                       <label className="text-sm font-medium">الاسم الكامل</label>
                       <p className="text-gray-600">{mockUser.fullName}</p>
                     </div>
                     <div>
                       <label className="text-sm font-medium">اسم المستخدم</label>
                       <p className="text-gray-600">{mockUser.username}</p>
                     </div>
                     <div>
                       <label className="text-sm font-medium">البريد الإلكتروني</label>
                       <p className="text-gray-600">{mockUser.email}</p>
                     </div>
                     <div>
                       <label className="text-sm font-medium">الدور</label>
                       <Badge
                         variant="outline"
                         className={
                           mockUser.role === "admin"
                             ? "border-purple-500 text-purple-700"
                             : mockUser.role === "data_entry"
                             ? "border-blue-500 text-blue-700"
                             : "border-gray-500 text-gray-700"
                         }
                       >
                         {mockUser.role === "admin" ? "مدير" : mockUser.role === "data_entry" ? "مدخل بيانات" : "مشاهد"}
                       </Badge>
                     </div>
                   </CardContent>
                 </Card>

                 <Card>
                   <CardHeader>
                     <CardTitle>إعدادات النظام</CardTitle>
                     <CardDescription>تكوين عام للمنصة</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="flex items-center justify-between">
                       <div>
                         <h4 className="font-medium">التحديثات العامة لصحة الحيوان</h4>
                         <p className="text-sm text-gray-600">عرض قسم التحديثات العالمية في الصفحة الرئيسية</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input
                           type="checkbox"
                           checked={isGlobalHealthUpdatesEnabled}
                           onChange={(e) => setIsGlobalHealthUpdatesEnabled(e.target.checked)}
                           className="sr-only peer"
                         />
                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                       </label>
                     </div>
                     <div className="flex items-center justify-between">
                       <div>
                         <h4 className="font-medium">إعادة تعيين البيانات</h4>
                         <p className="text-sm text-gray-600">استعادة البيانات الافتراضية</p>
                       </div>
                       <Button 
                         variant="destructive" 
                         size="sm"
                         onClick={() => {
                           if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟ سيتم فقدان جميع التعديلات.')) {
                             resetToDefaults()
                             alert('تم إعادة تعيين البيانات بنجاح')
                           }
                         }}
                       >
                         إعادة تعيين
                       </Button>
                     </div>
                   </CardContent>
                 </Card>

                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <Map className="h-5 w-5" />
                       إعدادات الخريطة التفاعلية
                     </CardTitle>
                     <CardDescription>تحكم في عرض وخصائص الخريطة التفاعلية</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="flex items-center justify-between">
                       <div>
                         <h4 className="font-medium">تفعيل الخريطة</h4>
                         <p className="text-sm text-gray-600">عرض الخريطة التفاعلية في الصفحة الرئيسية</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input
                           type="checkbox"
                           checked={mapSettings.isEnabled}
                           onChange={(e) => setMapSettings({...mapSettings, isEnabled: e.target.checked})}
                           className="sr-only peer"
                         />
                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                       </label>
                     </div>
                     
                     <div className="flex items-center justify-between">
                       <div>
                         <h4 className="font-medium">عرض بيانات السكان</h4>
                         <p className="text-sm text-gray-600">إظهار معلومات السكان على الخريطة</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input
                           type="checkbox"
                           checked={mapSettings.showPopulation}
                           onChange={(e) => setMapSettings({...mapSettings, showPopulation: e.target.checked})}
                           className="sr-only peer"
                         />
                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                       </label>
                     </div>
                     
                     <div className="flex items-center justify-between">
                       <div>
                         <h4 className="font-medium">عرض المدن</h4>
                         <p className="text-sm text-gray-600">إظهار المدن على الخريطة</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input
                           type="checkbox"
                           checked={mapSettings.showCities}
                           onChange={(e) => setMapSettings({...mapSettings, showCities: e.target.checked})}
                           className="sr-only peer"
                         />
                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                       </label>
                     </div>
                     
                     <div className="flex items-center justify-between">
                       <div>
                         <h4 className="font-medium">عرض الأحياء</h4>
                         <p className="text-sm text-gray-600">إظهار الأحياء على الخريطة</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input
                           type="checkbox"
                           checked={mapSettings.showDistricts}
                           onChange={(e) => setMapSettings({...mapSettings, showDistricts: e.target.checked})}
                           className="sr-only peer"
                         />
                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                       </label>
                     </div>
                     
                     <div className="flex items-center justify-between">
                       <div>
                         <h4 className="font-medium">تفعيل البحث</h4>
                         <p className="text-sm text-gray-600">إمكانية البحث في الخريطة</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input
                           type="checkbox"
                           checked={mapSettings.enableSearch}
                           onChange={(e) => setMapSettings({...mapSettings, enableSearch: e.target.checked})}
                           className="sr-only peer"
                         />
                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                       </label>
                     </div>
                     
                     <div className="flex items-center justify-between">
                       <div>
                         <h4 className="font-medium">تفعيل التحميل</h4>
                         <p className="text-sm text-gray-600">إمكانية تحميل بيانات الخريطة</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input
                           type="checkbox"
                           checked={mapSettings.enableDownload}
                           onChange={(e) => setMapSettings({...mapSettings, enableDownload: e.target.checked})}
                           className="sr-only peer"
                         />
                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                       </label>
                     </div>
                     
                     <div className="space-y-2">
                       <label className="block text-sm font-medium">مستوى التكبير الافتراضي</label>
                       <input
                         type="range"
                         min="4"
                         max="10"
                         value={mapSettings.defaultZoom}
                         onChange={(e) => setMapSettings({...mapSettings, defaultZoom: parseInt(e.target.value)})}
                         className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                       />
                       <div className="flex justify-between text-xs text-gray-500">
                         <span>4</span>
                         <span className="font-medium">{mapSettings.defaultZoom}</span>
                         <span>10</span>
                       </div>
                     </div>
                     
                     <div className="space-y-2">
                       <label className="block text-sm font-medium">نظام الألوان</label>
                       <select
                         value={mapSettings.colorScheme}
                         onChange={(e) => setMapSettings({...mapSettings, colorScheme: e.target.value})}
                         className="w-full p-2 border rounded-md"
                       >
                         <option value="population">حسب السكان</option>
                         <option value="risk">حسب المخاطر</option>
                         <option value="custom">مخصص</option>
                       </select>
                     </div>
                   </CardContent>
                 </Card>
                 
                 {/* قسم إعدادات الواجهة الرئيسية */}
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <Shield className="h-5 w-5" />
                       إعدادات الواجهة الرئيسية
                     </CardTitle>
                     <CardDescription>تحكم في عرض وخصائص عناصر الواجهة الرئيسية</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-6">
                     {/* إعدادات العرض */}
                     <div className="space-y-4">
                       <h4 className="font-medium text-lg border-b pb-2">إعدادات العرض</h4>
                       
                       <div className="flex items-center justify-between">
                         <div>
                           <h5 className="font-medium">عرض الرأس</h5>
                           <p className="text-sm text-gray-600">إظهار رأس الصفحة والقائمة العلوية</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input
                             type="checkbox"
                             checked={interfaceSettings.showHeader}
                             onChange={(e) => setInterfaceSettings({...interfaceSettings, showHeader: e.target.checked})}
                             className="sr-only peer"
                           />
                           <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                         </label>
                       </div>
                       
                       <div className="flex items-center justify-between">
                         <div>
                           <h5 className="font-medium">عرض القسم الرئيسي</h5>
                           <p className="text-sm text-gray-600">إظهار القسم الرئيسي مع العنوان والوصف</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input
                             type="checkbox"
                             checked={interfaceSettings.showHeroSection}
                             onChange={(e) => setInterfaceSettings({...interfaceSettings, showHeroSection: e.target.checked})}
                             className="sr-only peer"
                           />
                           <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                         </label>
                       </div>
                       
                       <div className="flex items-center justify-between">
                         <div>
                           <h5 className="font-medium">عرض قسم الإحصائيات</h5>
                           <p className="text-sm text-gray-600">إظهار بطاقات الإحصائيات الرئيسية</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input
                             type="checkbox"
                             checked={interfaceSettings.showStatsSection}
                             onChange={(e) => setInterfaceSettings({...interfaceSettings, showStatsSection: e.target.checked})}
                             className="sr-only peer"
                           />
                           <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                         </label>
                       </div>
                       
                       <div className="flex items-center justify-between">
                         <div>
                           <h5 className="font-medium">عرض قسم آخر التحديثات</h5>
                           <p className="text-sm text-gray-600">إظهار قسم المسوحات الحديثة</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input
                             type="checkbox"
                             checked={interfaceSettings.showRecentUpdatesSection}
                             onChange={(e) => setInterfaceSettings({...interfaceSettings, showRecentUpdatesSection: e.target.checked})}
                             className="sr-only peer"
                           />
                           <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                         </label>
                       </div>
                       
                       <div className="flex items-center justify-between">
                         <div>
                           <h5 className="font-medium">عرض قسم الميزات</h5>
                           <p className="text-sm text-gray-600">إظهار قسم الميزات الرئيسية للمنصة</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input
                             type="checkbox"
                             checked={interfaceSettings.showFeaturesSection}
                             onChange={(e) => setInterfaceSettings({...interfaceSettings, showFeaturesSection: e.target.checked})}
                             className="sr-only peer"
                           />
                           <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                         </label>
                       </div>
                       
                       <div className="flex items-center justify-between">
                         <div>
                           <h5 className="font-medium">عرض التذييل</h5>
                           <p className="text-sm text-gray-600">إظهار تذييل الصفحة</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input
                             type="checkbox"
                             checked={interfaceSettings.showFooter}
                             onChange={(e) => setInterfaceSettings({...interfaceSettings, showFooter: e.target.checked})}
                             className="sr-only peer"
                           />
                           <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                         </label>
                       </div>
                     </div>
                     
                     {/* إعدادات المحتوى */}
                     <div className="space-y-4">
                       <h4 className="font-medium text-lg border-b pb-2">إعدادات المحتوى</h4>
                       
                       <div className="space-y-2">
                         <label className="block text-sm font-medium">عنوان القسم الرئيسي</label>
                         <input
                           type="text"
                           value={interfaceSettings.heroTitle}
                           onChange={(e) => setInterfaceSettings({...interfaceSettings, heroTitle: e.target.value})}
                           className="w-full p-2 border rounded-md"
                           placeholder="عنوان المنصة"
                         />
                       </div>
                       
                       <div className="space-y-2">
                         <label className="block text-sm font-medium">العنوان الفرعي للقسم الرئيسي</label>
                         <input
                           type="text"
                           value={interfaceSettings.heroSubtitle}
                           onChange={(e) => setInterfaceSettings({...interfaceSettings, heroSubtitle: e.target.value})}
                           className="w-full p-2 border rounded-md"
                           placeholder="العنوان الفرعي"
                         />
                       </div>
                       
                       <div className="space-y-2">
                         <label className="block text-sm font-medium">وصف القسم الرئيسي</label>
                         <textarea
                           value={interfaceSettings.heroDescription}
                           onChange={(e) => setInterfaceSettings({...interfaceSettings, heroDescription: e.target.value})}
                           className="w-full p-2 border rounded-md h-20"
                           placeholder="وصف المنصة"
                         />
                       </div>
                       
                       <div className="space-y-2">
                         <label className="block text-sm font-medium">عنوان قسم آخر التحديثات</label>
                         <input
                           type="text"
                           value={interfaceSettings.recentUpdatesTitle}
                           onChange={(e) => setInterfaceSettings({...interfaceSettings, recentUpdatesTitle: e.target.value})}
                           className="w-full p-2 border rounded-md"
                           placeholder="عنوان قسم التحديثات"
                         />
                       </div>
                       
                       <div className="space-y-2">
                         <label className="block text-sm font-medium">وصف قسم آخر التحديثات</label>
                         <textarea
                           value={interfaceSettings.recentUpdatesDescription}
                           onChange={(e) => setInterfaceSettings({...interfaceSettings, recentUpdatesDescription: e.target.value})}
                           className="w-full p-2 border rounded-md h-16"
                           placeholder="وصف قسم التحديثات"
                         />
                       </div>
                       
                       <div className="space-y-2">
                         <label className="block text-sm font-medium">عنوان قسم الميزات</label>
                         <input
                           type="text"
                           value={interfaceSettings.featuresTitle}
                           onChange={(e) => setInterfaceSettings({...interfaceSettings, featuresTitle: e.target.value})}
                           className="w-full p-2 border rounded-md"
                           placeholder="عنوان قسم الميزات"
                         />
                       </div>
                       
                       <div className="space-y-2">
                         <label className="block text-sm font-medium">وصف قسم الميزات</label>
                         <textarea
                           value={interfaceSettings.featuresDescription}
                           onChange={(e) => setInterfaceSettings({...interfaceSettings, featuresDescription: e.target.value})}
                           className="w-full p-2 border rounded-md h-16"
                           placeholder="وصف قسم الميزات"
                         />
                       </div>
                       
                       <div className="space-y-2">
                         <label className="block text-sm font-medium">عدد المسوحات الحديثة المعروضة</label>
                         <input
                           type="number"
                           min="1"
                           max="10"
                           value={interfaceSettings.maxRecentSurveys}
                           onChange={(e) => setInterfaceSettings({...interfaceSettings, maxRecentSurveys: parseInt(e.target.value) || 3})}
                           className="w-full p-2 border rounded-md"
                         />
                         <p className="text-xs text-gray-500">عدد المسوحات التي ستظهر في قسم آخر التحديثات (1-10)</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               </div>
             </div>
           )}
         </div>
       </div>

       {/* نوافذ حوار إضافة وتعديل المسوحات */}
       {isAddSurveyDialogOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold">إضافة مسح وبائي جديد</h2>
               <Button 
                 variant="ghost" 
                 size="sm"
                 onClick={() => {
                   setIsAddSurveyDialogOpen(false)
                   setNewSurveyData({
                     startDate: '',
                     endDate: '',
                     status: 'planned',
                     totalSamples: 864,
                     positiveSamples: 12,
                     livestock: {
                       sheep: 0,
                       cattle: 0,
                       horses: 0,
                       camels: 0,
                       goats: 0
                     }
                   })
                 }}
               >
                 ✕
               </Button>
             </div>
             
             <form onSubmit={(e) => {
               e.preventDefault()
               handleAddSurvey()
             }} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium mb-1">المنطقة *</label>
                   <select 
                     value={selectedRegion || ''}
                     onChange={(e) => {
                       const regionId = e.target.value ? parseInt(e.target.value) : null
                       setSelectedRegion(regionId)
                       setSelectedGovernorate(null)
                     }}
                     className="w-full p-2 border rounded-md"
                     required
                   >
                     <option value="">اختر المنطقة</option>
                     {regions.map((region) => (
                       <option key={region.id} value={region.id}>
                         {region.nameAr}
                       </option>
                     ))}
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">المحافظة *</label>
                   <select 
                     value={selectedGovernorate || ''}
                     onChange={(e) => setSelectedGovernorate(e.target.value ? parseInt(e.target.value) : null)}
                     className="w-full p-2 border rounded-md"
                     required
                     disabled={!selectedRegion}
                   >
                     <option value="">اختر المحافظة</option>
                     {selectedRegion && regions.find(r => r.id === selectedRegion)?.governorates.map((gov) => (
                       <option key={gov.id} value={gov.id}>
                         {gov.nameAr}
                       </option>
                     ))}
                   </select>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium mb-1">تاريخ بداية المسح *</label>
                   <input 
                     type="date" 
                     value={newSurveyData.startDate}
                     onChange={(e) => setNewSurveyData({...newSurveyData, startDate: e.target.value})}
                     className="w-full p-2 border rounded-md"
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">تاريخ نهاية المسح</label>
                   <input 
                     type="date" 
                     value={newSurveyData.endDate}
                     onChange={(e) => setNewSurveyData({...newSurveyData, endDate: e.target.value})}
                     className="w-full p-2 border rounded-md"
                     min={newSurveyData.startDate}
                   />
                 </div>
               </div>
               
               <div>
                 <label className="block text-sm font-medium mb-1">حالة المسح *</label>
                 <select 
                   value={newSurveyData.status}
                   onChange={(e) => setNewSurveyData({...newSurveyData, status: e.target.value as 'planned' | 'in_progress' | 'completed'})}
                   className="w-full p-2 border rounded-md"
                   required
                 >
                   <option value="planned">مخطط</option>
                   <option value="in_progress">قيد التنفيذ</option>
                   <option value="completed">مكتمل</option>
                 </select>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium mb-1">إجمالي العينات *</label>
                   <input 
                     type="number" 
                     value={newSurveyData.totalSamples}
                     onChange={(e) => setNewSurveyData({...newSurveyData, totalSamples: parseInt(e.target.value) || 0})}
                     className="w-full p-2 border rounded-md"
                     min="1"
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">العينات الإيجابية *</label>
                   <input 
                     type="number" 
                     value={newSurveyData.positiveSamples}
                     onChange={(e) => setNewSurveyData({...newSurveyData, positiveSamples: parseInt(e.target.value) || 0})}
                     className="w-full p-2 border rounded-md"
                     min="0"
                     max={newSurveyData.totalSamples}
                     required
                   />
                 </div>
               </div>
               
               {/* قسم الثروة الحيوانية */}
               <div className="border-t pt-4">
                 <h3 className="text-lg font-semibold mb-3">الثروة الحيوانية</h3>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium mb-1">الأغنام</label>
                     <input 
                       type="number" 
                       value={newSurveyData.livestock.sheep}
                       onChange={(e) => setNewSurveyData({...newSurveyData, livestock: {...newSurveyData.livestock, sheep: parseInt(e.target.value) || 0}})}
                       className="w-full p-2 border rounded-md"
                       min="0"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1">الأبقار</label>
                     <input 
                       type="number" 
                       value={newSurveyData.livestock.cattle}
                       onChange={(e) => setNewSurveyData({...newSurveyData, livestock: {...newSurveyData.livestock, cattle: parseInt(e.target.value) || 0}})}
                       className="w-full p-2 border rounded-md"
                       min="0"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1">الخيل</label>
                     <input 
                       type="number" 
                       value={newSurveyData.livestock.horses}
                       onChange={(e) => setNewSurveyData({...newSurveyData, livestock: {...newSurveyData.livestock, horses: parseInt(e.target.value) || 0}})}
                       className="w-full p-2 border rounded-md"
                       min="0"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1">الإبل</label>
                     <input 
                       type="number" 
                       value={newSurveyData.livestock.camels}
                       onChange={(e) => setNewSurveyData({...newSurveyData, livestock: {...newSurveyData.livestock, camels: parseInt(e.target.value) || 0}})}
                       className="w-full p-2 border rounded-md"
                       min="0"
                     />
                   </div>
                   <div className="col-span-2">
                     <label className="block text-sm font-medium mb-1">الماعز</label>
                     <input 
                       type="number" 
                       value={newSurveyData.livestock.goats}
                       onChange={(e) => setNewSurveyData({...newSurveyData, livestock: {...newSurveyData.livestock, goats: parseInt(e.target.value) || 0}})}
                       className="w-full p-2 border rounded-md"
                       min="0"
                     />
                   </div>
                 </div>
               </div>
               
               <div className="flex gap-2 pt-4">
                 <Button type="submit" className="flex-1">
                   إضافة المسح
                 </Button>
                 <Button 
                   type="button" 
                   variant="outline" 
                   className="flex-1"
                   onClick={() => setIsAddSurveyDialogOpen(false)}
                 >
                   إلغاء
                 </Button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* نوافذ عرض الخرائط */}
       <SimpleMapModal 
         isOpen={isMapModalOpen}
         onClose={() => setIsMapModalOpen(false)}
         mapPath={selectedMapPath}
       />
       
       <AllMapsModalComponent 
         isOpen={isAllMapsModalOpen}
         onClose={() => setIsAllMapsModalOpen(false)}
         onSelectMap={(mapPath: string) => {
           setSelectedMapPath(mapPath)
           setIsMapModalOpen(true)
           setIsAllMapsModalOpen(false)
         }}
       />
       
       {/* نافذة عرض تفاصيل المسح */}
       <SurveyDetailModal 
         isOpen={isSurveyDetailModalOpen}
         onClose={() => setIsSurveyDetailModalOpen(false)}
         survey={selectedSurvey}
       />
     </div>
   )
 }
