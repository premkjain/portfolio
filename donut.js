document.addEventListener('DOMContentLoaded', () => {
    const preTag = document.getElementById('donut');
    
    // Increase screen dimensions for a larger donut
    const screen_width = 60; // Increased from 30 to 60
    const screen_height = 60; // Increased from 30 to 60
    
    const theta_spacing = 0.07;
    const phi_spacing = 0.02;
    
    const R1 = 1;
    const R2 = 2;
    const K2 = 5;
    const K1 = screen_width * K2 * 3 / (8 * (R1 + R2));
    
    function renderFrame(A, B) {
        const cosA = Math.cos(A), sinA = Math.sin(A);
        const cosB = Math.cos(B), sinB = Math.sin(B);
        
        const output = Array(screen_height).fill().map(() => Array(screen_width).fill(' '));
        const zbuffer = Array(screen_height).fill().map(() => Array(screen_width).fill(0));
        
        for (let theta = 0; theta < 2 * Math.PI; theta += theta_spacing) {
            const costheta = Math.cos(theta), sintheta = Math.sin(theta);
            
            for (let phi = 0; phi < 2 * Math.PI; phi += phi_spacing) {
                const cosphi = Math.cos(phi), sinphi = Math.sin(phi);
                
                const circlex = R2 + R1 * costheta;
                const circley = R1 * sintheta;
                
                const x = circlex * (cosB * cosphi + sinA * sinB * sinphi) - circley * cosA * sinB;
                const y = circlex * (sinB * cosphi - sinA * cosB * sinphi) + circley * cosA * cosB;
                const z = K2 + cosA * circlex * sinphi + circley * sinA;
                const ooz = 1 / z;
                
                const xp = Math.floor(screen_width / 2 + K1 * ooz * x);
                const yp = Math.floor(screen_height / 2 - K1 * ooz * y);
                
                const L = cosphi * costheta * sinB - cosA * costheta * sinphi -
                        sinA * sintheta + cosB * (cosA * sintheta - costheta * sinA * sinphi);
                
                if (L > 0 && xp >= 0 && xp < screen_width && yp >= 0 && yp < screen_height) {
                    if (ooz > zbuffer[yp][xp]) {
                        zbuffer[yp][xp] = ooz;
                        const luminance_index = Math.floor(L * 8);
                        output[yp][xp] = ".,-~:;=!*#$@"[luminance_index] || '@';
                    }
                }
            }
        }
        
        return output.map(row => row.join('')).join('\n');
    }
    
    let A = 0, B = 0;
    
    function animate() {
        preTag.textContent = renderFrame(A, B);
        A += 0.0175;
        B += 0.0075;
        requestAnimationFrame(animate);
    }
    
    animate();
});
