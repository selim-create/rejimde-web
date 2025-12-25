# Backend Configuration Checklist - rejimde-core Plugin

## Overview

Bu doküman, `rejimde-core` WordPress plugin'inde frontend ile uyumlu çalışması için gerekli konfigürasyonları listeler.

## ✅ Required Endpoints

### 1. Plans API

#### GET `/rejimde/v1/plans`
- [ ] Endpoint registered ve erişilebilir
- [ ] `category` query parametresi destekleniyor
- [ ] `difficulty` query parametresi destekleniyor
- [ ] Response formatı: `{ status: 'success', data: [...] }`
- [ ] Error formatı: `{ status: 'error', code: 'xxx', message: 'xxx' }`

#### GET `/rejimde/v1/plans/{slug}`
- [ ] Endpoint registered ve erişilebilir
- [ ] Slug parameter doğru parse ediliyor
- [ ] Response formatı: `{ status: 'success', data: {...} }`
- [ ] `plan_data` array olarak dönüyor (JSON parse edilmiş)
- [ ] `shopping_list` array olarak dönüyor (JSON parse edilmiş)
- [ ] Error formatı: `{ status: 'error', code: 'not_found', message: '...' }`

#### POST `/rejimde/v1/plans/create`
- [ ] Endpoint registered ve erişilebilir
- [ ] JWT authentication kontrolü yapılıyor
- [ ] User permission kontrolü yapılıyor (rejimde_pro veya admin)
- [ ] Request body validation yapılıyor
- [ ] `plan_data` array'i JSON string olarak kaydediliyor
- [ ] `shopping_list` array'i JSON string olarak kaydediliyor
- [ ] Response formatı: `{ status: 'success', data: {...} }`
- [ ] Error formatı: `{ status: 'error', code: 'xxx', message: 'xxx' }`

#### POST `/rejimde/v1/plans/update/{id}`
- [ ] Endpoint registered ve erişilebilir
- [ ] JWT authentication kontrolü yapılıyor
- [ ] Ownership validation (sadece author veya admin düzenleyebilir)
- [ ] Request body validation yapılıyor
- [ ] `plan_data` array'i JSON string olarak kaydediliyor
- [ ] `shopping_list` array'i JSON string olarak kaydediliyor
- [ ] Response formatı: `{ status: 'success', data: {...} }`

### 2. WordPress REST API Extension

#### GET `/wp/v2/rejimde_plan/{id}`
- [ ] Custom post type `rejimde_plan` registered
- [ ] `context=edit` parametresi destekleniyor
- [ ] Meta field'lar `show_in_rest` ile expose ediliyor
- [ ] `_embed` parametresi ile featured media gömülüyor
- [ ] JWT authentication ile korumalı

---

## ✅ Database Configuration

### Custom Post Type: `rejimde_plan`

```php
register_post_type('rejimde_plan', [
    'labels' => [...],
    'public' => true,
    'show_in_rest' => true,
    'rest_base' => 'rejimde_plan',
    'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
    'capability_type' => 'post',
    'map_meta_cap' => true,
]);
```

**Checklist:**
- [ ] Post type registered
- [ ] `show_in_rest` enabled
- [ ] Supports: title, editor, thumbnail, custom-fields
- [ ] Capabilities doğru yapılandırılmış

### Meta Fields Configuration

Aşağıdaki meta field'ların `wp_postmeta` tablosunda saklanması gerekiyor:

```php
register_post_meta('rejimde_plan', 'difficulty', [
    'type' => 'string',
    'single' => true,
    'show_in_rest' => true,
    'default' => 'medium',
]);

register_post_meta('rejimde_plan', 'duration', [
    'type' => 'string',
    'single' => true,
    'show_in_rest' => true,
]);

register_post_meta('rejimde_plan', 'calories', [
    'type' => 'string',
    'single' => true,
    'show_in_rest' => true,
]);

register_post_meta('rejimde_plan', 'score_reward', [
    'type' => 'string',
    'single' => true,
    'show_in_rest' => true,
    'default' => '100',
]);

register_post_meta('rejimde_plan', 'diet_category', [
    'type' => 'string',
    'single' => true,
    'show_in_rest' => true,
]);

register_post_meta('rejimde_plan', 'is_verified', [
    'type' => 'boolean',
    'single' => true,
    'show_in_rest' => true,
    'default' => false,
]);

register_post_meta('rejimde_plan', 'plan_data', [
    'type' => 'string', // JSON string
    'single' => true,
    'show_in_rest' => true,
    'sanitize_callback' => 'sanitize_json_meta',
]);

register_post_meta('rejimde_plan', 'shopping_list', [
    'type' => 'string', // JSON string
    'single' => true,
    'show_in_rest' => true,
    'sanitize_callback' => 'sanitize_json_meta',
]);
```

**Checklist:**
- [ ] `difficulty` meta field registered
- [ ] `duration` meta field registered
- [ ] `calories` meta field registered
- [ ] `score_reward` meta field registered
- [ ] `diet_category` meta field registered
- [ ] `is_verified` meta field registered
- [ ] `plan_data` meta field registered (JSON string)
- [ ] `shopping_list` meta field registered (JSON string)
- [ ] Tüm meta field'lar `show_in_rest` enabled
- [ ] JSON sanitization callback eklendi

### JSON Sanitization Function

```php
function sanitize_json_meta($meta_value) {
    if (is_string($meta_value)) {
        $decoded = json_decode($meta_value, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $meta_value; // Valid JSON
        }
    }
    
    if (is_array($meta_value)) {
        return json_encode($meta_value); // Convert array to JSON
    }
    
    return '[]'; // Default empty array
}
```

**Checklist:**
- [ ] JSON sanitization fonksiyonu eklendi
- [ ] Array'i JSON string'e çeviriyor
- [ ] Invalid JSON için fallback var

---

## ✅ REST API Controller

### Plans Controller (`/rejimde/v1/plans`)

```php
class Rejimde_Plans_Controller extends WP_REST_Controller {
    
    public function register_routes() {
        register_rest_route('rejimde/v1', '/plans', [
            'methods' => 'GET',
            'callback' => [$this, 'get_plans'],
            'permission_callback' => '__return_true',
        ]);
        
        register_rest_route('rejimde/v1', '/plans/(?P<slug>[a-zA-Z0-9-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_plan_by_slug'],
            'permission_callback' => '__return_true',
        ]);
        
        register_rest_route('rejimde/v1', '/plans/create', [
            'methods' => 'POST',
            'callback' => [$this, 'create_plan'],
            'permission_callback' => [$this, 'check_permission'],
        ]);
        
        register_rest_route('rejimde/v1', '/plans/update/(?P<id>\d+)', [
            'methods' => 'POST',
            'callback' => [$this, 'update_plan'],
            'permission_callback' => [$this, 'check_permission'],
        ]);
    }
    
    public function get_plans($request) {
        $category = $request->get_param('category');
        $difficulty = $request->get_param('difficulty');
        
        // Query logic...
        
        return rest_ensure_response([
            'status' => 'success',
            'data' => $plans
        ]);
    }
    
    public function get_plan_by_slug($request) {
        $slug = $request->get_param('slug');
        
        // Get plan logic...
        // Parse plan_data from JSON
        // Parse shopping_list from JSON
        
        if (!$plan) {
            return new WP_Error('not_found', 'Plan bulunamadı', ['status' => 404]);
        }
        
        return rest_ensure_response([
            'status' => 'success',
            'data' => $plan
        ]);
    }
    
    public function create_plan($request) {
        $data = $request->get_json_params();
        
        // Validation
        if (empty($data['title'])) {
            return new WP_Error('invalid_data', 'Plan başlığı gerekli', ['status' => 400]);
        }
        
        // Create post
        $post_id = wp_insert_post([
            'post_type' => 'rejimde_plan',
            'post_title' => $data['title'],
            'post_content' => $data['content'] ?? '',
            'post_status' => 'publish',
        ]);
        
        // Save meta
        update_post_meta($post_id, 'difficulty', $data['meta']['difficulty'] ?? 'medium');
        update_post_meta($post_id, 'duration', $data['meta']['duration'] ?? '7');
        update_post_meta($post_id, 'plan_data', json_encode($data['plan_data'] ?? []));
        update_post_meta($post_id, 'shopping_list', json_encode($data['shopping_list'] ?? []));
        
        return rest_ensure_response([
            'status' => 'success',
            'data' => ['id' => $post_id]
        ]);
    }
}
```

**Checklist:**
- [ ] Controller class oluşturuldu
- [ ] Route'lar registered
- [ ] GET `/plans` endpoint implement edildi
- [ ] GET `/plans/{slug}` endpoint implement edildi
- [ ] POST `/plans/create` endpoint implement edildi
- [ ] POST `/plans/update/{id}` endpoint implement edildi
- [ ] JSON encoding/decoding doğru yapılıyor
- [ ] Response format tutarlı: `{ status: 'success', data: ... }`
- [ ] Error handling: WP_Error kullanılıyor

---

## ✅ Authentication & Authorization

### JWT Configuration

```php
// wp-config.php
define('JWT_AUTH_SECRET_KEY', 'your-secret-key-here');
define('JWT_AUTH_CORS_ENABLE', true);
```

**Checklist:**
- [ ] JWT plugin installed (jwt-auth veya benzeri)
- [ ] `JWT_AUTH_SECRET_KEY` tanımlı
- [ ] CORS enabled (frontend farklı domain'de ise)
- [ ] JWT token expiry configured

### Permission Callbacks

```php
public function check_permission() {
    $user_id = get_current_user_id();
    
    if (!$user_id) {
        return new WP_Error('unauthorized', 'Giriş yapmalısınız', ['status' => 401]);
    }
    
    $user = wp_get_current_user();
    $allowed_roles = ['administrator', 'rejimde_pro'];
    
    if (!array_intersect($allowed_roles, $user->roles)) {
        return new WP_Error('forbidden', 'Bu işlem için yetkiniz yok', ['status' => 403]);
    }
    
    return true;
}
```

**Checklist:**
- [ ] JWT authentication middleware çalışıyor
- [ ] User roles doğru kontrol ediliyor
- [ ] Permission callback'ler doğru implement edilmiş

---

## ✅ Custom Tables (Opsiyonel)

Eğer progress tracking için custom table kullanılıyorsa:

### Table: `wp_rejimde_plan_progress`

```sql
CREATE TABLE wp_rejimde_plan_progress (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    plan_id BIGINT UNSIGNED NOT NULL,
    completed_items TEXT,
    progress_percentage INT DEFAULT 0,
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY user_plan (user_id, plan_id),
    KEY user_id (user_id),
    KEY plan_id (plan_id)
);
```

**Checklist:**
- [ ] Table created
- [ ] Indexes eklendi
- [ ] CRUD functions implement edildi

---

## ✅ CORS Configuration

Frontend farklı domain'de ise:

```php
// functions.php veya plugin
add_action('rest_api_init', function() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
});
```

**Checklist:**
- [ ] CORS headers eklendi
- [ ] OPTIONS preflight destekleniyor
- [ ] Authorization header allowed

---

## ✅ Testing Commands

### Test Endpoints (cURL)

```bash
# List Plans
curl -X GET "http://api.rejimde.com/wp-json/rejimde/v1/plans?category=keto&difficulty=medium"

# Get Plan by Slug
curl -X GET "http://api.rejimde.com/wp-json/rejimde/v1/plans/7-gunluk-keto-diyeti"

# Create Plan (with JWT token)
curl -X POST "http://api.rejimde.com/wp-json/rejimde/v1/plans/create" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Plan","content":"Test"}'

# Get Plan for Edit
curl -X GET "http://api.rejimde.com/wp-json/wp/v2/rejimde_plan/123?context=edit&_embed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Checklist:**
- [ ] List plans endpoint test edildi
- [ ] Get plan by slug endpoint test edildi
- [ ] Create plan endpoint test edildi (JWT ile)
- [ ] Update plan endpoint test edildi (JWT ile)
- [ ] WordPress REST API test edildi

---

## ✅ Common Issues & Solutions

### Issue 1: "Plan bulunamadı" hatası
**Çözüm:**
- Post type'ın `public => true` olduğundan emin olun
- Permalink'leri flush edin: `Settings > Permalinks > Save Changes`

### Issue 2: Meta field'lar görünmüyor
**Çözüm:**
- `show_in_rest => true` eklenmiş mi kontrol edin
- Meta field registration'ı `init` hook'unda yapın

### Issue 3: JWT authentication çalışmıyor
**Çözüm:**
- `.htaccess` dosyasında `Authorization` header allow edilmiş mi?
- JWT secret key tanımlı mı?

### Issue 4: JSON parse hatası
**Çözüm:**
- `plan_data` ve `shopping_list` string olarak kaydediliyor mu?
- `json_encode()` ve `json_decode()` doğru kullanılıyor mu?

### Issue 5: CORS hatası
**Çözüm:**
- CORS header'ları eklendi mi?
- Preflight OPTIONS request'lere izin veriliyor mu?

---

## ✅ Performance Optimization

### Caching

```php
// Cache plan list
$cache_key = 'rejimde_plans_' . md5($category . $difficulty);
$plans = wp_cache_get($cache_key);

if (false === $plans) {
    $plans = $this->query_plans($category, $difficulty);
    wp_cache_set($cache_key, $plans, '', 3600); // 1 hour
}
```

**Checklist:**
- [ ] Plan list caching implement edildi
- [ ] Plan detail caching implement edildi
- [ ] Cache invalidation on update

### Database Optimization

**Checklist:**
- [ ] Meta query'ler için index eklendi
- [ ] N+1 query problemi çözüldü
- [ ] WP_Query optimize edildi

---

## Contact

Backend sorunları için: backend@rejimde.com
