import * as THREE from 'three';
import { skills, projects, experience } from './data.js';

export class WebGLEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    
    // Cyberpunk night colors
    this.fogColorNight = new THREE.Color(0x050508);
    this.fogColorDay = new THREE.Color(0x2a1508);
    
    this.scene.background = this.fogColorNight;
    this.scene.fog = new THREE.FogExp2(this.fogColorNight, 0.002);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance"
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    this.clock = new THREE.Clock();
    
    // Group for the city
    this.cityGroup = new THREE.Group();
    this.scene.add(this.cityGroup);
    
    // Path for camera animation
    this.cameraPath = null;
    
    this.initLighting();
    this.createCity();
    this.createRain();
    this.createWebPath();
    this.createHolographicSkills();
    
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  initLighting() {
    this.ambientLight = new THREE.AmbientLight(0x111122, 0.5);
    this.scene.add(this.ambientLight);
    
    this.directionalLight = new THREE.DirectionalLight(0x00e5ff, 0.5);
    this.directionalLight.position.set(100, 200, 50);
    this.scene.add(this.directionalLight);
    
    // Lightning effect
    this.lightning = new THREE.PointLight(0xffffff, 0, 1000);
    this.lightning.position.set(0, 300, -100);
    this.scene.add(this.lightning);
  }
  
  createCity() {
    const buildingGeo = new THREE.BoxGeometry(1, 1, 1);
    
    // Dark building material
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a16,
      roughness: 0.8,
      metalness: 0.2,
    });

    // We will place random background buildings
    for(let i=0; i<200; i++) {
      const mesh = new THREE.Mesh(buildingGeo, buildingMat);
      
      const w = Math.random() * 20 + 10;
      const h = Math.random() * 200 + 50;
      const d = Math.random() * 20 + 10;
      
      mesh.scale.set(w, h, d);
      
      const x = (Math.random() - 0.5) * 800;
      const z = (Math.random() - 0.5) * 800 - 200;
      
      // Keep clear of center path
      if(Math.abs(x) < 50 && Math.abs(z) < 200) continue;
      
      mesh.position.set(x, h/2, z);
      this.cityGroup.add(mesh);
      
      // Add neon edges occasionally
      if(Math.random() > 0.8) {
        const edges = new THREE.EdgesGeometry(buildingGeo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
          color: Math.random() > 0.5 ? 0x00e5ff : 0xbd00ff,
          transparent: true,
          opacity: 0.3
        }));
        mesh.add(line);
      }
    }
    
    // Place Project Buildings (Interactive)
    projects.forEach(p => {
      const pMesh = new THREE.Mesh(buildingGeo, new THREE.MeshStandardMaterial({
        color: 0x111122,
        emissive: new THREE.Color(p.color).multiplyScalar(0.2),
        roughness: 0.4
      }));
      pMesh.scale.set(p.width, p.height, p.depth);
      pMesh.position.set(p.x, p.height/2, p.z);
      
      const edges = new THREE.EdgesGeometry(buildingGeo);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
        color: p.color,
        linewidth: 2
      }));
      pMesh.add(line);
      
      this.cityGroup.add(pMesh);
    });
  }
  
  createRain() {
    const rainCount = 15000;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    
    for(let i=0; i<rainCount*3; i+=3) {
      rainPos[i] = (Math.random() - 0.5) * 800;
      rainPos[i+1] = Math.random() * 500;
      rainPos[i+2] = (Math.random() - 0.5) * 800 - 200;
    }
    
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    
    this.rainMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.5,
      transparent: true,
      opacity: 0.6
    });
    
    this.rainSys = new THREE.Points(rainGeo, this.rainMat);
    this.scene.add(this.rainSys);
  }
  
  createWebPath() {
    // Cinematic camera path weaving through the city
    this.curvePoints = [
      new THREE.Vector3(0, 300, 150), // Start (Intro jump)
      new THREE.Vector3(0, 150, 50), // Landing
      new THREE.Vector3(-20, 80, -50), // Skills
      new THREE.Vector3(20, 100, -150), // Projects
      new THREE.Vector3(-30, 120, -250), // Experience
      new THREE.Vector3(0, 50, -350), // Achievements
      new THREE.Vector3(15, 35, -450), // Certificates
      new THREE.Vector3(0, 20, -550) // Sunrise Contact
    ];
    
    this.cameraPath = new THREE.CatmullRomCurve3(this.curvePoints);
    
    // Draw the glowing web along the path
    const tubeGeo = new THREE.TubeGeometry(this.cameraPath, 100, 0.5, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    
    const web = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(web);
  }
  
  createHolographicSkills() {
    this.skillsGroup = new THREE.Group();
    // Position near the skills curve point
    this.skillsGroup.position.copy(this.curvePoints[2]);
    this.skillsGroup.position.z -= 30; // offset slightly in front of camera
    
    const nodeGeo = new THREE.SphereGeometry(1.5, 16, 16);
    
    skills.forEach((skill, i) => {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        wireframe: true,
        transparent: true,
        opacity: 0.8
      });
      const mesh = new THREE.Mesh(nodeGeo, mat);
      
      // Spherical distribution
      const phi = Math.acos(-1 + (2 * i) / skills.length);
      const theta = Math.sqrt(skills.length * Math.PI) * phi;
      
      const r = 20;
      mesh.position.set(
        r * Math.cos(theta) * Math.sin(phi),
        r * Math.sin(theta) * Math.sin(phi),
        r * Math.cos(phi)
      );
      
      this.skillsGroup.add(mesh);
    });
    
    this.scene.add(this.skillsGroup);
  }
  
  triggerLightning() {
    if(Math.random() > 0.98) {
      this.lightning.intensity = Math.random() * 5000 + 2000;
      setTimeout(() => {
        this.lightning.intensity = 0;
      }, 100);
    }
  }
  
  update(time) {
    // Animate rain
    const positions = this.rainSys.geometry.attributes.position.array;
    for(let i=1; i<positions.length; i+=3) {
      positions[i] -= 3;
      if(positions[i] < 0) positions[i] = 500;
    }
    this.rainSys.geometry.attributes.position.needsUpdate = true;
    
    // Lightning
    this.triggerLightning();
    
    // Rotate skills
    if(this.skillsGroup) {
      this.skillsGroup.rotation.y += 0.005;
      this.skillsGroup.rotation.z += 0.002;
    }
    
    this.renderer.render(this.scene, this.camera);
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
