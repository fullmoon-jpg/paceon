"use client"
import React, { useEffect, useRef } from 'react';

const UnderConstruction = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // SPH Parameters
    const DOMAIN_SCALE = 30;
    const H = 1;
    const H2 = H * H;
    const H5 = Math.pow(H, 5);
    const H6 = Math.pow(H, 6);
    const H9 = Math.pow(H, 9);
    const WPOLY6_COEFF = 315.0 / (64 * Math.PI * H9);
    const WSPIKY_GRAD_COEFF = -45.0 / (Math.PI * H6);
    const WVISC_LAPL_COEFF = 45.0 / (Math.PI * H5);
    
    const MASS = 1.0;
    const GAS_CONST = 120;
    const REST_DENSITY = 0.5;
    const VISCOSITY = 3;
    const GRAVITY_X = 0;
    const GRAVITY_Y = -20;
    
    // Domain
    let xmin = 0;
    let xmax = width / DOMAIN_SCALE;
    let ymin = 0;
    let ymax = height / DOMAIN_SCALE;

    // Grid Cell
    class Cell {
      constructor() {
        this.particles = [];
        this.halfNeighbors = [];
      }
      
      reset() {
        this.particles = [];
      }
    }

    // Grid for spatial hashing
    class Grid {
      constructor() {
        this.cells = [];
        this.nx = 0;
        this.ny = 0;
        this.w = 0;
        this.h = 0;
      }

      init(nx, ny, w, h) {
        this.nx = nx;
        this.ny = ny;
        this.w = w;
        this.h = h;
        
        const numCells = nx * ny;
        this.cells = [];
        for (let i = 0; i < numCells; i++) {
          this.cells[i] = new Cell();
        }
        
        // Compute half neighbors for each cell
        for (let i = 0; i < nx; i++) {
          for (let j = 0; j < ny; j++) {
            const c = this.cells[i + j * nx];
            const idx = i + j * nx;
            
            if (i !== nx - 1) {
              c.halfNeighbors.push(this.cells[idx + 1]);
            }
            
            if (j !== ny - 1) {
              for (let i2 = Math.max(0, i - 1); i2 <= Math.min(nx - 1, i + 1); i2++) {
                c.halfNeighbors.push(this.cells[idx + nx + i2 - i]);
              }
            }
          }
        }
      }

      getCellFromLocation(x, y) {
        const i = Math.floor(this.nx * x / this.w);
        const j = Math.floor(this.ny * y / this.h);
        if (i < 0 || i >= this.nx || j < 0 || j >= this.ny) return null;
        return this.cells[i + j * this.nx];
      }

      addParticleToCell(p) {
        const c = this.getCellFromLocation(p.x, p.y);
        if (c) c.particles.push(p);
      }

      reset() {
        for (const c of this.cells) {
          c.reset();
        }
      }
    }

    // Particle
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5);
        this.vy = (Math.random() - 0.5);
        this.fx = 0;
        this.fy = 0;
        this.rho = 0;
        this.p = 0;
      }

      reset() {
        this.fx = 0;
        this.fy = 0;
        this.rho = MASS * Wpoly6(0);
      }
    }

    // Kernel functions
    const Wpoly6 = (r2) => {
      if (r2 >= H2) return 0;
      const temp = H2 - r2;
      return WPOLY6_COEFF * temp * temp * temp;
    };

    const Wspiky_grad2 = (r) => {
      if (r >= H || r < 0.0001) return 0;
      const temp = H - r;
      return WSPIKY_GRAD_COEFF * temp * temp / r;
    };

    const Wvisc_lapl = (r) => {
      if (r >= H) return 0;
      return WVISC_LAPL_COEFF * (1 - r / H);
    };

    const dist2 = (p1, p2) => {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      return dx * dx + dy * dy;
    };

    // Initialize
    const PARTICLE_COUNT = 700;
    const particles = [];
    const grid = new Grid();
    
    const numGridCellsX = Math.floor(xmax / H);
    const numGridCellsY = Math.floor(ymax / H);
    grid.init(numGridCellsX, numGridCellsY, xmax, ymax);

    // Create particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle(
        Math.random() * (xmax - xmin) + xmin,
        Math.random() * (ymax - ymin) * 0.5 + ymin + (ymax - ymin) * 0.3
      ));
    }

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let mouseVx = 0;
    let mouseVy = 0;
    let mouseActive = false;
    let mouseDown = false;
    let mouseScreenX = 0;
    let mouseScreenY = 0;

    // Waterfall particles queue
    const waterfallParticles = [];

    // Add density
    const AddDensity = (p1, p2) => {
      const r2 = dist2(p1, p2);
      if (r2 < H2) {
        const temp = MASS * Wpoly6(r2);
        p1.rho += temp;
        p2.rho += temp;
      }
    };

    // Calculate density
    const CalcDensity = () => {
      for (const cell of grid.cells) {
        for (let i = 0; i < cell.particles.length; i++) {
          const p1 = cell.particles[i];
          
          for (let j = i + 1; j < cell.particles.length; j++) {
            AddDensity(p1, cell.particles[j]);
          }
          
          for (const neighbor of cell.halfNeighbors) {
            for (let j = 0; j < neighbor.particles.length; j++) {
              AddDensity(p1, neighbor.particles[j]);
            }
          }
          
          p1.p = Math.max(GAS_CONST * (p1.rho - REST_DENSITY), 0);
        }
      }
    };

    // Add forces
    const AddForces = (p1, p2) => {
      const r2 = dist2(p1, p2);
      if (r2 < H2) {
        const r = Math.sqrt(r2) + 1e-6;
        
        const temp1 = MASS * (p2.p + p1.p) / (2 * p2.rho) * Wspiky_grad2(r);
        let fx = temp1 * (p2.x - p1.x);
        let fy = temp1 * (p2.y - p1.y);
        
        const temp2 = VISCOSITY * MASS * Wvisc_lapl(r) / p2.rho;
        fx += temp2 * (p2.vx - p1.vx);
        fy += temp2 * (p2.vy - p1.vy);
        
        p1.fx += fx;
        p1.fy += fy;
        p2.fx -= fx;
        p2.fy -= fy;
      }
    };

    // Wall forces
    const AddWallForces = (p) => {
      if (p.x < xmin + H) {
        const r = p.x - xmin;
        p.fx -= MASS * p.p / p.rho * Wspiky_grad2(r) * r;
      } else if (p.x > xmax - H) {
        const r = xmax - p.x;
        p.fx += MASS * p.p / p.rho * Wspiky_grad2(r) * r;
      }
      
      if (p.y < ymin + H) {
        const r = p.y - ymin;
        p.fy -= MASS * p.p / p.rho * Wspiky_grad2(r) * r;
      } else if (p.y > ymax - H) {
        const r = ymax - p.y;
        p.fy += MASS * p.p / p.rho * Wspiky_grad2(r) * r;
      }
    };

    // Calculate forces
    const CalcForces = () => {
      for (const cell of grid.cells) {
        for (let i = 0; i < cell.particles.length; i++) {
          const p1 = cell.particles[i];
          
          for (let j = i + 1; j < cell.particles.length; j++) {
            AddForces(p1, cell.particles[j]);
          }
          
          for (const neighbor of cell.halfNeighbors) {
            for (let j = 0; j < neighbor.particles.length; j++) {
              AddForces(p1, neighbor.particles[j]);
            }
          }
          
          AddWallForces(p1);
        }
      }
    };

    // Mouse interaction - Push effect
    const CalcForcedVelocity = () => {
      if (!mouseActive) return;
      
      const interactionRadius = H * 2.5;
      const interactionRadius2 = interactionRadius * interactionRadius;
      
      for (const p of particles) {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist2 = dx * dx + dy * dy;
        
        if (dist2 < interactionRadius2 && dist2 > 0.001) {
          const dist = Math.sqrt(dist2);
          const force = (1 - dist / interactionRadius);
          
          // Push particles away from mouse
          const pushForce = 12;
          p.vx += (dx / dist) * force * pushForce + mouseVx * force * 0.15;
          p.vy += (dy / dist) * force * pushForce + mouseVy * force * 0.15;
        }
      }
    };

    // Waterfall effect - Lusion style
    let waterfallSpawnTimer = 0;
    const SpawnWaterfallParticles = (dt) => {
      if (!mouseDown) {
        waterfallSpawnTimer = 0;
        return;
      }
      
      // Spawn continuously while mouse is down
      waterfallSpawnTimer += dt;
      const spawnRate = 0.02; // Spawn every 20ms
      
      if (waterfallSpawnTimer >= spawnRate) {
        waterfallSpawnTimer = 0;
        
        // Find farthest particles from mouse
        const sorted = particles
          .map((p, idx) => {
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            return { particle: p, dist: dx * dx + dy * dy, idx };
          })
          .sort((a, b) => b.dist - a.dist);
        
        // Spawn 3-5 particles at a time
        const numToSpawn = Math.floor(Math.random() * 3) + 3;
        
        for (let i = 0; i < Math.min(numToSpawn, sorted.length / 3); i++) {
          const p = sorted[i].particle;
          
          // Spawn at mouse with slight random spread
          const angle = Math.random() * Math.PI * 2;
          const spreadRadius = 0.3;
          
          p.x = mouseX + Math.cos(angle) * spreadRadius * Math.random();
          p.y = mouseY + Math.sin(angle) * spreadRadius * Math.random();
          
          // Initial velocity with spread
          const velocityAngle = Math.random() * Math.PI * 2;
          const velocityMagnitude = Math.random() * 3 + 1;
          p.vx = Math.cos(velocityAngle) * velocityMagnitude;
          p.vy = Math.sin(velocityAngle) * velocityMagnitude - 2; // Bias downward
          
          p.fx = 0;
          p.fy = 0;
          p.rho = MASS * Wpoly6(0);
          
          // Add to waterfall particles for visual effect
          waterfallParticles.push({
            x: mouseScreenX,
            y: mouseScreenY,
            life: 1.0,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 2
          });
        }
      }
    };

    // Update waterfall visual particles
    const UpdateWaterfallParticles = (dt) => {
      for (let i = waterfallParticles.length - 1; i >= 0; i--) {
        const wp = waterfallParticles[i];
        wp.life -= dt * 2;
        wp.x += wp.vx;
        wp.y += wp.vy;
        
        if (wp.life <= 0) {
          waterfallParticles.splice(i, 1);
        }
      }
    };

    // Update positions
    let lastTime = performance.now();
    const UpdatePosition = (dt) => {
      dt = Math.min(dt, 0.033);
      
      for (const p of particles) {
        if (p.rho < 0.001) p.rho = REST_DENSITY;
        
        const ax = p.fx / p.rho + GRAVITY_X;
        const ay = p.fy / p.rho + GRAVITY_Y;

        p.vx += ax * dt;
        p.vy += ay * dt;
        
        const maxVel = 50;
        p.vx = Math.max(-maxVel, Math.min(maxVel, p.vx));
        p.vy = Math.max(-maxVel, Math.min(maxVel, p.vy));

        p.x += (p.vx + 0.5 * ax * dt) * dt;
        p.y += (p.vy + 0.5 * ay * dt) * dt;

        if (p.x < xmin) {
          p.x = xmin + 1e-6;
          p.vx *= -0.5;
        } else if (p.x > xmax) {
          p.x = xmax - 1e-6;
          p.vx *= -0.5;
        }
        
        if (p.y < ymin) {
          p.y = ymin + 1e-6;
          p.vy *= -0.5;
        } else if (p.y > ymax) {
          p.y = ymax - 1e-6;
          p.vy *= -0.5;
        }

        grid.addParticleToCell(p);
        p.reset();
      }
    };

    // Animation loop
    const animate = () => {
      // Clear with slight fade for motion blur - #fb6f7a background
      ctx.fillStyle = 'rgba(251, 111, 122, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // Physics
      const now = performance.now();
      const dt = (now - lastTime) * 0.001;
      lastTime = now;
      
      CalcDensity();
      CalcForces();
      CalcForcedVelocity();
      SpawnWaterfallParticles(dt);
      UpdateWaterfallParticles(dt);
      grid.reset();
      UpdatePosition(dt);

      // Draw mouse interaction visual
      if (mouseActive || mouseDown) {
        const radius = mouseDown ? 60 : 40;
        const gradient = ctx.createRadialGradient(
          mouseScreenX, mouseScreenY, 0,
          mouseScreenX, mouseScreenY, radius
        );
        gradient.addColorStop(0, 'rgba(95, 1, 1, 0.3)');
        gradient.addColorStop(0.5, 'rgba(95, 1, 1, 0.15)');
        gradient.addColorStop(1, 'rgba(95, 1, 1, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseScreenX, mouseScreenY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Ring effect
        if (mouseDown) {
          ctx.strokeStyle = 'rgba(95, 1, 1, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(mouseScreenX, mouseScreenY, 50, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Draw waterfall particles
      waterfallParticles.forEach(wp => {
        const alpha = wp.life * 0.6;
        ctx.fillStyle = `rgba(95, 1, 1, ${alpha})`;
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render main particles
      particles.forEach(p => {
        if (!isFinite(p.x) || !isFinite(p.y) || !isFinite(p.rho)) return;
        
        const x = p.x * DOMAIN_SCALE;
        const y = height - (p.y * DOMAIN_SCALE);
        
        if (!isFinite(x) || !isFinite(y)) return;
        
        const size = 3.5;
        
        // Particle color: #5f0101
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(95, 1, 1, 0.9)';
        ctx.fill();
        
        // Subtle glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
        gradient.addColorStop(0, 'rgba(95, 1, 1, 0.5)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Mouse handlers
    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseTimeout = null;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      mouseScreenX = x;
      mouseScreenY = y;
      mouseX = x / DOMAIN_SCALE;
      mouseY = (height - y) / DOMAIN_SCALE;
      
      const dx = x - lastMouseX;
      const dy = y - lastMouseY;
      mouseVx = dx * 0.15;
      mouseVy = -dy * 0.15;
      mouseActive = true;
      
      lastMouseX = x;
      lastMouseY = y;
      
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        mouseActive = false;
        mouseVx = 0;
        mouseVy = 0;
      }, 100);
    };

    const handleMouseDown = (e) => {
      mouseDown = true;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseScreenX = x;
      mouseScreenY = y;
      mouseX = x / DOMAIN_SCALE;
      mouseY = (height - y) / DOMAIN_SCALE;
    };

    const handleMouseUp = () => {
      mouseDown = false;
    };

    const handleMouseLeave = () => {
      mouseDown = false;
      mouseActive = false;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      xmax = width / DOMAIN_SCALE;
      ymax = height / DOMAIN_SCALE;
      
      const nx = Math.floor(xmax / H);
      const ny = Math.floor(ymax / H);
      grid.init(nx, ny, xmax, ymax);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      clearTimeout(mouseTimeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-950">
      <canvas ref={canvasRef} className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 pointer-events-none">
        <div className="text-center space-y-8 max-w-2xl">
          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Coming Soon
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light">
              We're building something amazing soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;