import React from 'react';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  test_score: number;
  test_completed: boolean;
  certificate_issued: boolean;
  certificate_available_at: string | null;
  signature_data: string | null;
  created_at: string;
}

interface TestResults {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  userId: string;
}

export const generateCertificateHTML = (user: UserProfile, results: TestResults) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <div style="
      width: 1000px; 
      height: 750px; 
      background: white; 
      border: 4px solid #1e3a8a; 
      padding: 40px; 
      position: relative; 
      margin: 0 auto; 
      box-shadow: 0 0 0 2px #c9aa69, 0 0 0 4px #1e3a8a, 0 20px 60px rgba(0,0,0,0.2); 
      font-family: serif; 
      text-align: center;
    ">
      <!-- Outer decorative borders -->
      <div style="position: absolute; inset: 0; border: 4px solid #c9aa69;"></div>
      <div style="position: absolute; inset: 8px; border: 4px solid #1e3a8a;"></div>
      
      <!-- Main Content -->
      <div style="position: relative; z-index: 10; padding-top: 0px; padding-bottom: 40px; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
        <!-- Logo -->
        <div style="position: absolute; top: -50px; left: 50%; transform: translateX(-50%); z-index: 20;">
          <div style="padding: 8px; width: 200px; height: 200px; display: flex; align-items: center; justify-content: center;">
            <img src="/Global-Security-Practitioners-Alliance.png" alt="GSPA Logo" style="width: 200px; object-fit: contain;" />
          </div>
        </div>

        <!-- Certification ID (Top Right) -->
        <div style="position: absolute; top: 20px; right: 40px; z-index: 20;">
          <div style="font-size: 12px; font-weight: bold; color: #202430ff; margin-bottom: 2px;">CERTIFICATION ID</div>
          <div style="font-size: 12px; font-weight: bold; color: black;">
            GSI-${user.id.slice(0, 8).toUpperCase()}
          </div>
        </div>

        <!-- Main Title Section -->
        <div style="margin-top: 80px;">
          <div style="font-size: 36px; font-weight: bold; color: #202430ff; margin-bottom: 8px;">Global Security Practitioners Alliance</div>
          <div style="font-size: 20px; color: #c9aa69; font-weight: 600; margin-bottom: 16px;">Professional Security Certification</div>
          <div style="width: 200px; height: 2px; background: #1e3a8a; margin: 0 auto 24px;"></div>
          <div style="font-size: 48px; font-weight: bold; color: black; margin-bottom: 24px; font-style: italic;">Course Certificate</div>
          <div style="font-size: 20px; color: #202430ff; margin-bottom: 8px; font-style: italic;">This certifies that</div>
          <div style="font-size: 36px; font-weight: bold; color: #1e3a8a; margin: 8px 0; padding: 0 8px 8px; border-bottom: 6px solid #c9aa69; display: inline-block; min-width: 250px;">
            ${user?.first_name || "John"} ${user?.last_name || "Doe"}
          </div>
        </div>
        

        <!-- Date (Bottom Left) -->
       <div style="
        position: absolute; 
        bottom: 40px; 
        left: 40px; 
        background: #ffffff; 
        border: 1px solid #c9aa69; 
        border-radius: 12px; 
        box-shadow: 0 4px 8px rgba(0,0,0,0.15); 
        padding: 15px 24px; 
        text-align: center; 
        max-width: 250px;
      ">
        <div style="font-size: 14px; font-weight: bold; color: #0d2340; margin-bottom: 6px;">
          DATE OF ACHIEVEMENT
        </div>
        <div style="font-size: 18px; font-weight: bold; color: #0d2340; background: #f9fafb; padding: 8px 12px; border-radius: 8px;">
          ${currentDate}
        </div>
      </div>

        <!-- Centered Seal -->
        <div style="position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Outer circle -->
            <circle cx="60" cy="60" r="58" fill="#0d2340" stroke="#a37e37" stroke-width="2" />

            <!-- Inner decorative circle -->
            <circle cx="60" cy="60" r="50" fill="none" stroke="#a37e37" stroke-width="1" stroke-dasharray="2 2" />

            <!-- Center circle background -->
            <circle cx="60" cy="60" r="42" fill="#a37e37" />

            <!-- Inner circle -->
            <circle cx="60" cy="60" r="40" fill="#0d2340" />

            <!-- Decorative stars -->
            <g fill="#a37e37">
              <!-- Top star -->
              <polygon points="60,25 62,31 68,31 63,35 65,41 60,37 55,41 57,35 52,31 58,31" transform="translate(0, 5)" />

              <!-- Bottom star -->
              <polygon
                points="60,25 62,31 68,31 63,35 65,41 60,37 55,41 57,35 52,31 58,31"
                transform="translate(0, 45) rotate(180 60 35)"
              />

              <!-- Left star -->
              <polygon
                points="60,25 62,31 68,31 63,35 65,41 60,37 55,41 57,35 52,31 58,31"
                transform="translate(-25, 25) rotate(270 60 35)"
              />

              <!-- Right star -->
              <polygon
                points="60,25 62,31 68,31 63,35 65,41 60,37 55,41 57,35 52,31 58,31"
                transform="translate(25, 25) rotate(90 60 35)"
              />
            </g>

            <!-- Text -->
            <text x="60" y="55" text-anchor="middle" fill="#a37e37" font-size="11" font-weight="bold" font-family="serif">
              GSPA
            </text>

            <text x="60" y="70" text-anchor="middle" fill="#a37e37" font-size="9" font-weight="bold" font-family="serif">
              CERTIFIED
            </text>

            <!-- Decorative ribbon elements -->
            <path d="M35 85 L45 80 L55 85 L45 90 Z" fill="#a37e37" />
            <path d="M65 85 L75 80 L85 85 L75 90 Z" fill="#a37e37" />
          </svg>
        </div>

        <!-- Director's Signature (Bottom Right) -->
        <div style="position: absolute; bottom: 40px; right: 40px; text-align: center;">
          <div style="border-top: 2px solid #1e3a8a; width: 200px; margin: 8px 0;"></div>
          <div style="font-size: 15px; color: #1e3a8a; margin-bottom: 4px;">Director of Professional Certification</div>
          <div style="font-size: 13px; color: #c9aa69; font-style: italic;">Global Security Institute</div>
        </div>
      </div>
    </div>
  `;
};
