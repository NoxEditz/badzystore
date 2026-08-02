# Frontend Hardcoded Content Review & Action Plan

## Date: 2026-08-02

## Summary of Findings

### ✅ Already Dynamic (Good!)
- Hero section (tag, title, subtitle) - via `heroTagEn/Ar`, `heroTitleEn/Ar`, `heroSubtitleEn/Ar`
- Categories section - via `categoriesEyebrowEn/Ar`, `categoriesTitleEn/Ar`
- Featured section - via `featuredEyebrowEn/Ar`, `featuredTitleEn/Ar`, `featuredEnabled`
- Trending section - via `trendingEyebrowEn/Ar`, `trendingTitleEn/Ar`, `trendingEnabled`
- Announcement bar - via `announcementEnabled`, `announcementTextEn/Ar`, `announcementItems[]`
- Trust badges - via `trustCards[]` array (4 cards with titleEn/Ar, subtitleEn/Ar)
- WhatsApp number - via `whatsappNumber` setting
- InstaPay handle - via `instapayHandle` setting
- Shipping thresholds - via `freeShippingThresholdEGP`, `defaultShippingFeeEGP`
- Product categories - via `customCategories[]` array

---

## ❌ Hardcoded Content That Needs to Be Dynamic

### 1. **Homepage Stats Section** (index.tsx lines 168-171)
Currently hardcoded:
```typescript
{ value: "24h", label: lang === "ar" ? "توصيل أسرع" : "Fastest delivery" },
{ value: "Egypt", label: lang === "ar" ? "توصيل لكل محافظة" : "Nationwide" },
```

**Solution**: Add to StoreSettings:
```typescript
statsCards: {
  deliverySpeed: { valueEn: "24h", valuAr: "24h", labelEn: "Fastest delivery", labelAr: "توصيل أسرع" },
  deliveryScope: { valueEn: "Egypt", valueAr: "مصر", labelEn: "Nationwide", labelAr: "توصيل لكل محافظة" }
}
```

---

### 2. **Footer Content** (Footer.tsx)

#### 2a. Footer Description (lines 72-74)
Currently hardcoded:
```typescript
"Badzy Store — Egypt's premier gaming accessories and setup gear provider..."
```

**Solution**: Add to StoreSettings:
```typescript
footerDescriptionEn: string;
footerDescriptionAr: string;
```

#### 2b. Trust Badge Subtitles (lines 24, 36, 48, 60)
Currently hardcoded:
- "COD & Encrypted Payments"
- "2–5 Business Days"
- "Hassle-free guarantee"
- "Official product coverage"

**Solution**: Already exists in `trustCards[]` but Footer is not using them. Need to refactor Footer to use `settings.trustCards` instead of hardcoded content.

#### 2c. Footer Category Links (lines 84-102)
Currently hardcoded categories: mice, keyboards, headsets, rgb

**Solution**: Already dynamic via `customCategories`, but Footer needs to use them instead of hardcoded links.

#### 2d. Footer Copyright & Tagline (lines 138-139)
Currently hardcoded:
```typescript
<p>© {new Date().getFullYear()} Badzy Store Egypt. All rights reserved.</p>
<p className="font-mono">Built for real Egyptian gamers.</p>
```

**Solution**: Add to StoreSettings:
```typescript
footerCopyrightEn: string;
footerCopyrightAr: string;
footerTaglineEn: string;
footerTaglineAr: string;
```

---

### 3. **Product Page Delivery Estimates** (product.$slug.tsx lines 290-297)

Currently uses i18n dictionary:
```typescript
t.product.deliveryEstimateTitle
t.product.cairoAlex // "Alexandria & Cairo: 1–2 Business Days"
t.product.restEgypt // "Rest of Egypt: 3–5 Business Days"
```

**Solution**: Add to StoreSettings:
```typescript
deliveryEstimateTitleEn: string;
deliveryEstimateTitleAr: string;
deliveryCairoAlexEn: string;
deliveryCairoAlexAr: string;
deliveryRestEgyptEn: string;
deliveryRestEgyptAr: string;
```

---

### 4. **Product Page Review Placeholder** (product.$slug.tsx line 359)

Currently hardcoded:
```typescript
"Rated 4.8 / 5 stars based on customer feedback across Egypt."
```

**Solution**: Add to StoreSettings:
```typescript
reviewsPlaceholderEn: string;
reviewsPlaceholderAr: string;
```

---

### 5. **Contact Page Location** (contact.tsx line 141)

Currently hardcoded:
```typescript
<span>Alexandria & Cairo, Egypt</span>
```

**Solution**: Add to StoreSettings:
```typescript
storeLocationEn: string;
storeLocationAr: string;
```

---

### 6. **Meta Tags & SEO** (__root.tsx lines 27-34)

Currently hardcoded store description:
```typescript
"Shop mice, mechanical keyboards, RGB accessories and streaming gear at Badzy Store. Fast delivery across Egypt."
```

**Solution**: Add to StoreSettings:
```typescript
seoDescriptionEn: string;
seoDescriptionAr: string;
seoKeywords: string;
```

---

### 7. **Store Name** (Multiple locations)

Currently uses `CONFIG.storeName` = "Badzy Store" which is in config.ts

**Solution**: Add to StoreSettings:
```typescript
storeNameEn: string;
storeNameAr: string;
```

---

## Implementation Priority

### Phase 1: High Priority (User-Facing Content)
1. ✅ Hero section - DONE
2. ✅ Announcement bar - DONE
3. ✅ Trust cards/badges - DONE
4. ⏳ Footer description & tagline - **TODO**
5. ⏳ Homepage stats section - **TODO**

### Phase 2: Medium Priority (SEO & Information)
6. ⏳ Delivery estimates - **TODO**
7. ⏳ Store location - **TODO**
8. ⏳ Meta/SEO descriptions - **TODO**

### Phase 3: Low Priority (Polish)
9. ⏳ Review placeholder text - **TODO**
10. ⏳ Footer copyright text - **TODO**

---

## Recommended Action

**Create a comprehensive settings update that adds:**
- Footer settings (description, tagline, copyright)
- Stats cards for homepage
- Delivery estimate texts
- Store location
- SEO meta descriptions
- Review placeholder

**Then update components to:**
- Footer.tsx: Use `settings.trustCards`, `customCategories`, and new footer settings
- index.tsx: Use dynamic stats cards
- product.$slug.tsx: Use dynamic delivery estimates and review placeholder
- contact.tsx: Use dynamic location
- __root.tsx: Use dynamic SEO descriptions

---

## Estimated Impact

- **Before**: ~15-20 hardcoded strings across frontend
- **After**: 100% dynamic content editable from admin panel
- **Admin Benefit**: Complete control without code changes
- **Developer Benefit**: Single source of truth for all content
