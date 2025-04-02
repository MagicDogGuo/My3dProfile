import * as THREE from 'three';

// 創建場景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // 天空藍色背景

// 創建相機
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 3);
camera.lookAt(0, 0, 0);

// 創建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 創建射線檢測器
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// 定義每個平面的配置
const planeConfigs = [
    {
        textureUrl: '/assets/mm.png',
        targetUrl: 'https://kuochunghsuan.com/',
        position: { x: 0, y: 0, z: 0 }
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
        position: { x: -10, y: 0.5, z: -6 }
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
        color: 0xffffff
    });

    const plane = new THREE.Mesh(circleGeometry, material);
    plane.position.set(config.position.x, config.position.y, config.position.z);
    plane.rotation.x = Math.random() * 0.2 - 0.1;
    plane.rotation.y = Math.random() * 0.2 - 0.1;
    
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

// 添加燈光效果
const frontLight = new THREE.DirectionalLight(0xffffff, 1);
frontLight.position.set(0, 0, 2);
scene.add(frontLight);

const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
backLight.position.set(0, 0, -2);
scene.add(backLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// 添加背景建築
// const buildingTexture = new THREE.TextureLoader().load('/assets/skybox.webp', (texture) => {
//     const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
//     rt.fromEquirectangularTexture(renderer, texture);
//     scene.background = rt.texture;
// });

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