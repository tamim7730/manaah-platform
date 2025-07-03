# ملف إحداثيات المناطق السعودية

## الوصف
يحتوي هذا الملف على إحداثيات دقيقة لجميع المناطق الإدارية الـ13 في المملكة العربية السعودية بصيغة GeoJSON.

## الملف
`public/saudi-regions-accurate.geojson`

## المناطق المشمولة

1. **الرياض** - العاصمة: الرياض
2. **مكة المكرمة** - العاصمة: مكة المكرمة
3. **المدينة المنورة** - العاصمة: المدينة المنورة
4. **القصيم** - العاصمة: بريدة
5. **المنطقة الشرقية** - العاصمة: الدمام
6. **عسير** - العاصمة: أبها
7. **تبوك** - العاصمة: تبوك
8. **حائل** - العاصمة: حائل
9. **الحدود الشمالية** - العاصمة: عرعر
10. **جازان** - العاصمة: جازان
11. **نجران** - العاصمة: نجران
12. **الباحة** - العاصمة: الباحة
13. **الجوف** - العاصمة: سكاكا

## البيانات المتوفرة لكل منطقة

- **name_ar**: الاسم باللغة العربية
- **name_en**: الاسم باللغة الإنجليزية
- **id**: معرف فريد للمنطقة
- **population**: عدد السكان
- **capital**: عاصمة المنطقة
- **geometry**: الإحداثيات الجغرافية للحدود

## كيفية الاستخدام

### في JavaScript
```javascript
// تحميل البيانات
fetch('/saudi-regions-accurate.geojson')
  .then(response => response.json())
  .then(data => {
    console.log('المناطق السعودية:', data.features);
    
    // عرض أسماء المناطق
    data.features.forEach(region => {
      console.log(`${region.properties.name_ar} - ${region.properties.name_en}`);
    });
  });
```

### مع مكتبة Leaflet
```javascript
// إضافة الطبقة إلى الخريطة
fetch('/saudi-regions-accurate.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: '#ff7800',
        weight: 2,
        opacity: 0.65
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup(`
          <h3>${feature.properties.name_ar}</h3>
          <p><strong>العاصمة:</strong> ${feature.properties.capital}</p>
          <p><strong>عدد السكان:</strong> ${feature.properties.population.toLocaleString()}</p>
        `);
      }
    }).addTo(map);
  });
```

### مع مكتبة Mapbox GL JS
```javascript
map.on('load', function() {
  map.addSource('saudi-regions', {
    'type': 'geojson',
    'data': '/saudi-regions-accurate.geojson'
  });
  
  map.addLayer({
    'id': 'saudi-regions-fill',
    'type': 'fill',
    'source': 'saudi-regions',
    'paint': {
      'fill-color': '#088',
      'fill-opacity': 0.8
    }
  });
  
  map.addLayer({
    'id': 'saudi-regions-border',
    'type': 'line',
    'source': 'saudi-regions',
    'paint': {
      'line-color': '#000',
      'line-width': 2
    }
  });
});
```

## ملاحظات

- الإحداثيات مبنية على نظام WGS84 (EPSG:4326)
- البيانات تغطي كامل حدود المملكة العربية السعودية
- يمكن استخدام الملف مع أي مكتبة خرائط تدعم صيغة GeoJSON
- البيانات السكانية مبنية على آخر الإحصائيات المتاحة

## التحديثات المستقبلية

يمكن تحديث الملف لإضافة:
- إحداثيات أكثر دقة للحدود
- بيانات إضافية مثل المساحة والكثافة السكانية
- أسماء المحافظات والمراكز داخل كل منطقة
- معلومات اقتصادية وجغرافية إضافية