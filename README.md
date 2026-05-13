# Cheers & Fly – Performance & Accessibility Optimization

## 🔗 Live URL
https://cheersandfly.com/

---

## 📉 Baseline Metrics (Before)

### Lighthouse (Mobile)
- Performance: 28
- Accessibility: 89
- Best practices - 92
- SEO - 82
- LCP: 16.3s
- FCP: 4.2
- CLS: 0
- Speed Index: 12.7s
- Total Blocking Time - 3790ms

---

## 🚨 Key Issues Identified
- Large unoptimized hero images
- No browser caching for static assets
- Render-blocking CSS
- Missing alt attributes
- Poor heading hierarchy

---

## ✅ Optimizations Applied

### Performance
- Image compression + WebP
- Apache caching via `.htaccess`
- CSS optimization (remove unused / defer)
- Font loading optimization

### Accessibility
- Proper heading structure
- Alt text for images
- Landmark roles added
- Color contrast fixes

---

## 📈 Results (After)

### Lighthouse (Mobile)
- Performance: XX → **YY**
- Accessibility: XX → **YY**
- LCP: X.Xs → **Y.Ys**
- CLS: X.XX → **0.0X**

---

## 🧠 Learnings
- Small static-site fixes can massively improve LCP
- Caching alone gives big Lighthouse jumps
- Accessibility fixes are low-effort, high-impact