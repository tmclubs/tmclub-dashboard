# Implementation Plan: President Director & Product Gallery for Company Detail

## Overview
Menambahkan dua fitur baru ke halaman Company Detail (http://localhost:5173/companies/1):
1. **President Director** - Menampilkan direktur utama perusahaan
2. **Product Gallery** - Menampilkan galeri produk perusahaan (seperti Instagram grid)

---

## Phase 1: Backend API Changes (tcmapi)

### 1.1 Add President Director Field to Company Model
**File**: `backend/apps/company/models.py`

**Changes**:
```python
class CompanyModel(models.Model):
    # ... existing fields ...
    president_director = models.CharField(max_length=200, null=True, blank=True, help_text="Nama Presiden Direktur Perusahaan")
```

### 1.2 Create Product Model
**File**: `backend/apps/company/models.py`

**New Model**:
```python
class CompanyProductModel(models.Model):
    company = models.ForeignKey(CompanyModel, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=250)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    category = models.CharField(max_length=100, null=True, blank=True)
    image = models.ForeignKey('common.FileModel', on_delete=models.SET_NULL, null=True, blank=True, related_name='product_images')
    images = models.ManyToManyField('common.FileModel', blank=True, related_name='product_galleries')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'company_products'
        verbose_name = 'Company Product'
        verbose_name_plural = 'Company Products'
        ordering = ['-created_at']
```

### 1.3 Update Company Serializers
**File**: `backend/apps/company/serializers.py`

**Add to DetailCompanySerializer**:
```python
class DetailCompanySerializer(serializers.ModelSerializer):
    # ... existing fields ...
    president_director = serializers.CharField(required=False, allow_null=True)
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = CompanyModel
        fields = [
            # ... existing fields ...
            'president_director',
            'products_count',
        ]

    def get_products_count(self, obj):
        return obj.products.filter(is_active=True).count()
```

### 1.4 Create Product Serializers
**File**: `backend/apps/company/serializers.py`

**New Serializers**:
```python
class CompanyProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    images_url = serializers.SerializerMethodField()

    class Meta:
        model = CompanyProductModel
        fields = [
            'pk',
            'name',
            'description',
            'price',
            'category',
            'image',
            'image_url',
            'images_url',
            'is_active',
            'created_at',
            'updated_at',
        ]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.image.url)
            return obj.image.image.url
        return None

    def get_images_url(self, obj):
        request = self.context.get('request')
        images_urls = []
        for img in obj.images.all():
            if request:
                images_urls.append(request.build_absolute_uri(img.image.url))
            else:
                images_urls.append(img.image.url)
        return images_urls
```

### 1.5 Create Product ViewSet
**File**: `backend/apps/company/views.py`

**New ViewSet**:
```python
class CompanyProductViewSet(viewsets.ModelViewSet):
    queryset = CompanyProductModel.objects.filter(is_active=True)
    serializer_class = CompanyProductSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        company_id = self.kwargs.get('company_id')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        return queryset

    def perform_create(self, serializer):
        company_id = self.kwargs.get('company_id')
        company = get_object_or_404(CompanyModel, pk=company_id)
        serializer.save(company=company, created_by=self.request.user)
```

### 1.6 Update URL Routes
**File**: `backend/apps/company/urls.py`

**Add Product Routes**:
```python
router.register(r'(?P<company_id>\d+)/products', CompanyProductViewSet, basename='company-products')
```

### 1.7 Create Database Migration
```bash
cd backend
python manage.py makemigrations company
python manage.py migrate
```

---

## Phase 2: Frontend Type Definitions

### 2.1 Update Company Interface
**File**: `src/types/api.ts`

**Add to Company interface**:
```typescript
export interface Company {
  pk: number;
  display_name: string;
  slug?: string;
  address: string;
  main_image?: any;
  main_image_url?: string | null;
  image_url?: string;
  description: string;
  contact: string;
  email: string;
  city: string;
  president_director?: string | null; // NEW FIELD
  products_count?: number; // NEW FIELD
  members_count?: number;
  members?: CompanyMember[];
  products?: CompanyProduct[]; // NEW FIELD
}
```

### 2.2 Add Product Interface
**File**: `src/types/api.ts`

**New Interface**:
```typescript
export interface CompanyProduct {
  pk: number;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  image?: any;
  image_url?: string | null;
  images_url?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyProductFormData {
  name: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
  images?: string[];
}
```

---

## Phase 3: Frontend API Integration

### 3.1 Update Company API Service
**File**: `src/lib/api/companies.ts`

**Add Product Endpoints**:
```typescript
export const companyProductsApi = {
  // Get products for a company
  list: (companyId: number) =>
    api.get(`/api/company/${companyId}/products/`),

  // Get single product
  retrieve: (companyId: number, productId: number) =>
    api.get(`/api/company/${companyId}/products/${productId}/`),

  // Create product
  create: (companyId: number, data: CompanyProductFormData) =>
    api.post(`/api/company/${companyId}/products/`, data),

  // Update product
  update: (companyId: number, productId: number, data: Partial<CompanyProductFormData>) =>
    api.put(`/api/company/${companyId}/products/${productId}/`, data),

  // Delete product
  delete: (companyId: number, productId: number) =>
    api.delete(`/api/company/${companyId}/products/${productId}/`),
};
```

### 3.2 Create Products Hook
**File**: `src/lib/hooks/useCompanies.ts`

**Add Hook**:
```typescript
export const useCompanyProducts = (companyId: number) => {
  return useQuery({
    queryKey: ['company-products', companyId],
    queryFn: () => companyProductsApi.list(companyId),
    enabled: !!companyId,
  });
};
```

---

## Phase 4: Frontend UI Components

### 4.1 Update Company Detail Page
**File**: `src/pages/public/CompanyDetail.tsx`

**Add President Director Section** (after header, before content):
```tsx
{/* President Director Section */}
{company.president_director && (
  <Card className="mb-6 border-l-4 border-l-orange-500">
    <CardContent className="py-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
          <UserCog className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Presiden Direktur</p>
          <p className="text-lg font-semibold text-gray-900">{company.president_director}</p>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

**Add Product Gallery Section** (after Members Section):
```tsx
{/* Products Gallery Section */}
{company.products && company.products.length > 0 && (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-600" />
          Produk & Layanan
        </CardTitle>
        <span className="text-sm text-gray-500">
          {company.products_count || company.products.length} Produk
        </span>
      </div>
    </CardHeader>
    <CardContent>
      {/* Instagram-style Grid Layout */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3">
        {company.products.map((product) => (
          <div
            key={product.pk}
            className="relative aspect-square rounded-sm overflow-hidden group cursor-pointer hover:opacity-90 transition-opacity"
          >
            <LazyImage
              src={product.image_url || '/placeholder-product.png'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* Product Info Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-semibold text-sm truncate">{product.name}</p>
                {product.price && (
                  <p className="text-orange-300 text-xs font-medium">
                    {formatCurrency(product.price)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {company.products_count > 9 && (
        <div className="text-center mt-4">
          <Button variant="outline" size="sm">
            Lihat Semua Produk ({company.products_count})
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
)}
```

### 4.2 Add Import for New Icons
```typescript
import { UserCog, Package } from 'lucide-react';
```

### 4.3 Update Company Detail Hook
**File**: `src/pages/public/CompanyDetail.tsx`

**Add products query**:
```typescript
const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: company, isLoading, error } = useCompany(Number(id));
  const { data: products } = useCompanyProducts(Number(id)); // NEW

  // Merge products into company data
  const companyWithProducts = useMemo(() => {
    if (!company) return null;
    return {
      ...company,
      products: products?.results || products || [],
    };
  }, [company, products]);
```

---

## Phase 5: Admin Dashboard (Optional)

### 5.1 Create Product Management Component
**File**: `src/components/features/companies/CompanyProductForm.tsx`

Form untuk create/edit product dengan:
- Product name input
- Description textarea
- Price input
- Category input
- Main image upload
- Multiple images upload (gallery)

### 5.2 Add Product Management to Company Detail (Admin)
Update dashboard company detail page untuk include:
- Product list with edit/delete buttons
- Add new product button
- Product gallery preview

---

## Phase 6: Testing & Deployment

### 6.1 Backend Testing
- Test president_director field creation and update
- Test product CRUD operations
- Test product image uploads
- Test pagination for products

### 6.2 Frontend Testing
- Test president director display
- Test product gallery grid layout
- Test responsive design (mobile, tablet, desktop)
- Test image loading states
- Test empty states

### 6.3 Deployment Checklist
- [ ] Backend migrations applied
- [ ] API endpoints documented
- [ ] Frontend types updated
- [ ] Components tested
- [ ] Responsive design verified
- [ ] Images loading correctly
- [ ] Error handling in place

---

## Implementation Priority

### High Priority (MVP):
1. ✅ Backend: Add `president_director` field to Company model
2. ✅ Backend: Create CompanyProduct model
3. ✅ Backend: Update serializers
4. ✅ Frontend: Update types
5. ✅ Frontend: Display president director
6. ✅ Frontend: Display product gallery (Instagram-style)

### Medium Priority:
7. Admin product management UI
8. Product detail modal/page
9. Advanced product filtering

### Low Priority (Future):
10. Product categories
11. Product search
12. Product reviews/ratings

---

## Estimated Timeline

- **Backend**: 2-3 hours
- **Frontend Types & API**: 1 hour
- **Frontend UI Components**: 2-3 hours
- **Testing**: 1-2 hours

**Total**: 6-9 hours for complete implementation

---

## Notes

- Product gallery akan menggunakan layout Instagram-style grid (3 columns)
- President director akan ditampilkan di bagian atas dengan card khusus
- Product images akan mendukung multiple images per product
- Responsive design akan dioptimalkan untuk mobile & desktop
- Empty state akan ditampilkan jika belum ada produk
