// lib/utils/loopEmailTemplate.ts

export const loopRegistrationConfirmationTemplate = (data: {
  name: string;
  email: string;
  phone: string;
  institution: string;
  instagram: string;
  foodChoice: string;
  drinkChoice: string;
}) => {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LOOP Series - Pembayaran Dikonfirmasi!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial Black', Arial, sans-serif; background-color: #F4F4F0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4F4F0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border: 6px solid #000000; box-shadow: 12px 12px 0px #000000;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #CCFF00; padding: 30px 40px; border-bottom: 6px solid #000000; text-align: center;">
              <img src="https://paceon.id/images/logo-loop-white.png" alt="LOOP SERIES" style="max-width: 300px; height: auto; display: block; margin: 0 auto;" />
              <p style="margin: 15px 0 0 0; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #000000;">
                PACE ON PRESENTS
              </p>
            </td>
          </tr>

          <!-- Confirmation Badge -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <div style="background-color: #21c36e; display: inline-block; padding: 15px 30px; border: 4px solid #000000; box-shadow: 6px 6px 0px #000000; transform: rotate(-2deg);">
                <p style="margin: 0; font-size: 20px; font-weight: 900; color: #FFFFFF; text-transform: uppercase;">
                  PEMBAYARAN DIKONFIRMASI
                </p>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 900; text-transform: uppercase; color: #000000; border-left: 8px solid #FF0099; padding-left: 20px;">
                Halo, ${data.name}!
              </h2>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #000000; font-weight: bold;">
                Selamat! Kamu <strong>RESMI TERDAFTAR</strong> di <strong>LOOP #1: How To Create Content Like Creator</strong>!
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #000000;">
                Pembayaran kamu sudah kami terima dan dikonfirmasi. Bersiap-siap untuk pengalaman learning yang gak bakal lo lupain!
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #000000;">
                Simpan email ini baik-baik sebagai <strong>bukti registrasi kamu</strong>. Detail lengkap tentang rundown acara dan info penting lainnya akan kami kirim <strong>H-3 sebelum event</strong>.
              </p>

              <!-- Participant Info -->
              <div style="background-color: #E0E7FF; border: 4px solid #000000; padding: 25px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 900; text-transform: uppercase; color: #000000;">
                  DATA PESERTA
                </h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="font-size: 14px; font-weight: bold; color: #666666; width: 40%;">Nama:</td>
                    <td style="font-size: 14px; font-weight: 900; color: #000000;">${data.name}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; font-weight: bold; color: #666666;">Email:</td>
                    <td style="font-size: 14px; font-weight: 900; color: #000000;">${data.email}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; font-weight: bold; color: #666666;">WhatsApp:</td>
                    <td style="font-size: 14px; font-weight: 900; color: #000000;">${data.phone}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; font-weight: bold; color: #666666;">Institusi:</td>
                    <td style="font-size: 14px; font-weight: 900; color: #000000;">${data.institution}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; font-weight: bold; color: #666666;">Instagram:</td>
                    <td style="font-size: 14px; font-weight: 900; color: #000000;">${data.instagram}</td>
                  </tr>
                </table>
              </div>

              <!-- Food & Drink Choices -->
              <div style="background-color: #37c35f; border: 4px solid #000000; padding: 25px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 900; text-transform: uppercase; color: #FFFFFF;">
                  PILIHAN MAKANAN & MINUMAN
                </h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="font-size: 14px; font-weight: bold; color: rgba(255,255,255,0.8); width: 40%;">Makanan:</td>
                    <td style="font-size: 16px; font-weight: 900; color: #FFFFFF;">${data.foodChoice}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; font-weight: bold; color: rgba(255,255,255,0.8);">Minuman:</td>
                    <td style="font-size: 16px; font-weight: 900; color: #FFFFFF;">${data.drinkChoice}</td>
                  </tr>
                </table>
                <p style="margin: 15px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.9); font-weight: bold;">
                  ☕ Pesanan kamu akan disiapkan di hari event!
                </p>
              </div>

              <!-- Event Details -->
              <div style="background-color: #FF0099; border: 4px solid #000000; padding: 25px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 900; text-transform: uppercase; color: #FFFFFF;">
                  DETAIL EVENT
                </h3>
                <table width="100%" cellpadding="10" cellspacing="0">
                  <tr>
                    <td style="font-size: 14px; font-weight: bold; color: rgba(255,255,255,0.8); width: 30%;">Tanggal:</td>
                    <td style="font-size: 16px; font-weight: 900; color: #FFFFFF;">7 Februari 2026</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; font-weight: bold; color: rgba(255,255,255,0.8);">Waktu:</td>
                    <td style="font-size: 16px; font-weight: 900; color: #FFFFFF;">08:30 - 13:30 WIB</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; font-weight: bold; color: rgba(255,255,255,0.8);">Lokasi:</td>
                    <td style="font-size: 16px; font-weight: 900; color: #FFFFFF;">Kopikina Cikini, Jakarta</td>
                  </tr>
                </table>
              </div>

              <!-- What to Bring -->
              <div style="background-color: #CCFF00; border: 4px solid #000000; padding: 25px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 900; text-transform: uppercase; color: #000000;">
                  YANG PERLU DIBAWA
                </h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.8; color: #000000; font-weight: bold;">
                  <li>Laptop (wajib!)</li>
                  <li>Charger & power bank</li>
                  <li>Notebook & alat tulis</li>
                  <li>Email konfirmasi ini (screenshot juga ok!)</li>
                  <li>Semangat & vibes positif!</li>
                </ul>
              </div>

              <!-- Important Note -->
              <div style="background-color: #FFF3CD; border: 4px solid #000000; border-left: 8px solid #FF0099; padding: 20px; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 14px; font-weight: bold; color: #000000; line-height: 1.6;">
                  CATATAN PENTING:
                </p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px; color: #000000; line-height: 1.8;">
                  <li>Event dimulai <strong>TEPAT JAM 08:30 WIB</strong>. Dateng on-time ya!</li>
                  <li>Makanan & minuman sesuai pilihan kamu akan disediakan</li>
                  <li>Detail rundown lengkap akan dikirim H-3</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- CTA Buttons -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://instagram.com/paceon.id" 
                       style="display: inline-block; background-color: #FFFFFF; color: #000000; font-size: 16px; font-weight: 900; text-transform: uppercase; text-decoration: none; padding: 18px 40px; border: 4px solid #000000; box-shadow: 6px 6px 0px #000000; margin-bottom: 15px;">
                      FOLLOW @PACEON.ID
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 20px 0 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                      Tag temen-temen lo yang tertarik! Share excitement-nya di IG Story dengan mention <strong>@paceon.id</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #000000; padding: 30px 40px; border-top: 6px solid #CCFF00; text-align: center;">
              <h2 style="margin: 0 0 20px 0; font-size: 36px; font-weight: 900; color: #CCFF00; text-transform: uppercase; letter-spacing: -1px;">
                PACE ON.
              </h2>
              
              <!-- Social Media Links -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" style="display: inline-block;">
                      <tr>
                        <!-- Instagram -->
                        <td style="padding: 0 10px;">
                          <a href="https://instagram.com/paceon.id" style="text-decoration: none;">
                            <div style="background-color: #FFFFFF; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #CCFF00;">
                              <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" style="width: 24px; height: 24px;" />
                            </div>
                          </a>
                        </td>
                        
                        <!-- TikTok -->
                        <td style="padding: 0 10px;">
                          <a href="https://tiktok.com/@paceon.id" style="text-decoration: none;">
                            <div style="background-color: #FFFFFF; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #CCFF00;">
                              <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" style="width: 24px; height: 24px;" />
                            </div>
                          </a>
                        </td>
                        
                        <!-- LinkedIn -->
                        <td style="padding: 0 10px;">
                          <a href="https://linkedin.com/company/paceon" style="text-decoration: none;">
                            <div style="background-color: #FFFFFF; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #CCFF00;">
                              <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style="width: 24px; height: 24px;" />
                            </div>
                          </a>
                        </td>
                        
                        <!-- WhatsApp -->
                        <td style="padding: 0 10px;">
                          <a href="https://wa.me/6281995538939" style="text-decoration: none;">
                            <div style="background-color: #FFFFFF; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #CCFF00;">
                              <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp" style="width: 24px; height: 24px;" />
                            </div>
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 10px 0; font-size: 12px; color: rgba(255,255,255,0.6);">
                hi@paceon.id | +62 819-9553-8939
              </p>
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid rgba(255,255,255,0.2);">
                <p style="margin: 0; font-size: 14px; color: #CCFF00; font-weight: bold;">
                  See you at Cikini!
                </p>
              </div>
            </td>
          </tr>

        </table>

        <!-- Small Print -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; margin-top: 20px;">
          <tr>
            <td style="text-align: center; font-size: 11px; color: #666666; line-height: 1.5;">
              Email ini dikirim otomatis dari sistem PACE ON.<br/>
              Simpan email ini sebagai bukti registrasi resmi kamu. Untuk bantuan, hubungi <a href="mailto:hi@paceon.id" style="color: #FF0099; font-weight: bold;">hi@paceon.id</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;
};