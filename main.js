import * as THREE from 'three';

// 創建場景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfefae0); // 天

// 創建相機
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 8);  
camera.lookAt(0, 0, 0);

// 創建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// 創建射線檢測器
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// 定義每個平面的配置
const planeConfigs = [
    {
        textureUrl: '/assets/mm.png',
        targetUrl: 'https://kuochunghsuan.com/',
        position: { x: 0, y: 0, z: 1 }
    },
    {
        textureUrl: '/assets/forkVR.png',
        targetUrl: 'https://kuochunghsuan.com/Forklife-License-VR-Training-S-curve',
        position: { x: 5, y: 0.3, z: -2 }
    },
    {
        textureUrl: '/assets/ARHealth.png',
        targetUrl: 'https://kuochunghsuan.com/GoodFace-A-Digital-Facial-Palsy-Patient-Care-Application',
        position: { x: -5, y: -0.3, z: -4 }
    },
    {
        textureUrl: '/assets/robotGame.png',
        targetUrl: 'https://kuochunghsuan.com/Adventurer',
        position: { x: -7, y: 0.3, z: -1 }
    }
];

// 創建圓形裁剪的照片平面
const radius = 1;
const segments = 64;
const circleGeometry = new THREE.CircleGeometry(radius, segments);

// 創建四個照片平面
const photoPlanes = [];
const planeStates = [];

// 為每個平面創建獨立的材質和狀態
planeConfigs.forEach((config, i) => {
    const texture = new THREE.TextureLoader().load(config.textureUrl);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.5
    });

    const plane = new THREE.Mesh(circleGeometry, material);
    plane.position.set(config.position.x, config.position.y, config.position.z);
    plane.rotation.x = Math.random() * 0.2 - 0.1;
    plane.rotation.y = Math.random() * 0.2 - 0.1;
    
    // 啟用陰影
    plane.castShadow = true;
    plane.receiveShadow = true;
    
    // 存儲URL信息
    plane.userData.targetUrl = config.targetUrl;
    
    scene.add(plane);
    photoPlanes.push(plane);
    
    planeStates.push({
        isMouseDown: false,
        isDragging: false,
        previousMousePosition: { x: 0, y: 0 },
        originalPosition: { ...plane.position },
        originalRotation: { ...plane.rotation }
    });
});

// 添加攝影棚燈光效果
const mainLight = new THREE.DirectionalLight(0xffffff, 2);
mainLight.position.set(0, 2, 2);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
mainLight.shadow.camera.near = 0.5;
mainLight.shadow.camera.far = 100;
mainLight.shadow.camera.left = -10;
mainLight.shadow.camera.right = 10;
mainLight.shadow.camera.top = 10;
mainLight.shadow.camera.bottom = -10;
mainLight.shadow.bias = -0.0001;
mainLight.shadow.normalBias = 0.02;
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
fillLight.position.set(-2, 1, -2);
fillLight.castShadow = true;
fillLight.shadow.mapSize.width = 1024;
fillLight.shadow.mapSize.height = 1024;
fillLight.shadow.bias = -0.0001;
fillLight.shadow.normalBias = 0.02;
scene.add(fillLight);

// const backLight = new THREE.DirectionalLight(0xffffff, 0.8);
// backLight.position.set(2, 1, -2);
// backLight.castShadow = true;
// scene.add(backLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

// 添加地面反射
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0xe9edc9,  // 稍微灰一点的白色
    roughness: 0.9,
    metalness: 0.1
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2;
ground.receiveShadow = true;
scene.add(ground);

// 滑鼠移動檢測hover效果
document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(photoPlanes);

    // 重置所有平面的顏色
    photoPlanes.forEach(plane => {
        plane.material.color.setHex(0xffffff);
    });

    // 如果有相交的平面，將其變色
    if (intersects.length > 0) {
        intersects[0].object.material.color.setHex(0xF8F4A6);
    }
});

// 點擊事件處理
document.addEventListener('mousedown', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(photoPlanes);

    if (intersects.length > 0) {
        const clickedPlane = intersects[0].object;
        const planeIndex = photoPlanes.indexOf(clickedPlane);
        
        planeStates[planeIndex].isMouseDown = true;
        planeStates[planeIndex].isDragging = false;
        planeStates[planeIndex].previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
});

document.addEventListener('mouseup', () => {
    planeStates.forEach(state => {
        state.isMouseDown = false;
    });
});

document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    photoPlanes.forEach((plane, index) => {
        const state = planeStates[index];
        
        if (state.isMouseDown) {
            const deltaMove = {
                x: event.clientX - state.previousMousePosition.x,
                y: event.clientY - state.previousMousePosition.y
            };

            if (Math.abs(deltaMove.x) > 5 || Math.abs(deltaMove.y) > 5) {
                state.isDragging = true;
            }

            plane.rotation.y += deltaMove.x * 0.01;
            plane.rotation.x += deltaMove.y * 0.01;

            state.previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        }
    });
});

// 點擊事件處理
document.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(photoPlanes);

    if (intersects.length > 0) {
        const clickedPlane = intersects[0].object;
        const planeIndex = photoPlanes.indexOf(clickedPlane);
        
        if (!planeStates[planeIndex].isDragging) {
            window.open(clickedPlane.userData.targetUrl, '_blank');
        }
    }
});

// 動畫函數
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    
    time += 0.01;
    photoPlanes.forEach((plane, index) => {
        const state = planeStates[index];
        if (!state.isMouseDown) {
            const phase = index * Math.PI / 2;
            plane.position.y = planeConfigs[index].position.y + Math.sin(time + phase) * 0.1;
            plane.rotation.z = Math.sin(time * 0.5 + phase) * 0.05;
        }
    });
    
    renderer.render(scene, camera);
}

// 處理窗口大小變化
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 改變滑鼠樣式
renderer.domElement.style.cursor = 'pointer';

animate(); 