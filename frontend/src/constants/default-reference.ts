export const DEFAULT_STATS_REFERENCE = `
PANDUAN ACUAN TEORITIS DAN INTERPRETASI STATISTIK (STANDAR APA 7th):

1. Uji-t (t-Test):
   - Tingkat Signifikansi: p < 0.05 (signifikan), p < 0.01 (sangat signifikan), p < 0.001 (sangat amat signifikan).
   - Uji Homogenitas Varians (Levene's Test): jika p < 0.05 (varians heterogen), gunakan Welch's t-test.
   - Ukuran Pengaruh (Cohen's d):
     * d = 0.20 : Efek kecil (Small effect)
     * d = 0.50 : Efek sedang (Medium effect)
     * d = 0.80 : Efek besar (Large effect)

2. ANOVA (Analysis of Variance):
   - Uji F: Membandingkan variansi antar kelompok terhadap variansi dalam kelompok.
   - Effect size:
     * Partial Eta Squared (η²p): 0.01 (kecil), 0.06 (sedang), 0.14 (besar).
   - Post-hoc: Tukey HSD digunakan jika varians homogen, mengontrol Family-wise Error Rate (FWER).

3. ANCOVA (Analysis of Covariance):
   - Digunakan untuk menguji perbedaan kelompok setelah menyesuaikan/mengontrol variabel perancu (kovariat, misal SES Siswa).
   - Asumsi Krusial: Homogeneity of Regression Slopes (interaksi Faktor × Kovariat p > 0.05). Jika p < 0.05, asumsi kelurusan lereng terlanggar.

4. MANOVA (Multivariate ANOVA):
   - Statistik Multivariate:
     * Wilks' Lambda (Λ): Nilai mendekati 0 mengindikasikan perbedaan kelompok yang kuat.
     * Pillai's Trace: Paling robust terhadap pelanggaran asumsi multivariat normalitas.
     * Hotelling-Lawley & Roy's Largest Root: Uji sensitif untuk sumbu diskriminan pertama.
   - Uji Homogenitas Matriks Kovarians (Box's M Test): p > 0.001 menunjukkan kovariansi setara.

5. Multilevel Modeling (Hierarchical Linear Modeling - HLM):
   - Struktur Data: Siswa (Level 1) bersarang dalam Sekolah (Level 2).
   - Intraclass Correlation Coefficient (ICC, ρ = τ₀₀ / (τ₀₀ + σ²)):
     * ICC < 0.05 : Variasi antar sekolah sangat kecil, regresi OLS standar cukup.
     * ICC ≥ 0.05 - 0.25 : Diperlukan analisis multilevel karena efek kluster sekolah signifikan.
     * ICC > 0.25 : Efek sekolah sangat dominan dalam menentukan capaian literasi/numerasi siswa.
   - Snijders & Bosker R²: Proporsi reduksi varians pada Level 1 (Siswa) dan Level 2 (Sekolah).
   - Kebaikan Suai Model: Nilai AIC, BIC, dan Deviance (-2LL) yang lebih rendah menunjukkan model yang lebih fit.
`.trim();
