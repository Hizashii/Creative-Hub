import { useEffect, useRef } from "react";

export function RotatingCubeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void import("three").then((THREE) => {
      if (disposed || !mountRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 0, 7);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const cubeMaterials = [
        new THREE.MeshStandardMaterial({ color: 0x3525cd, roughness: 0.45, metalness: 0.08 }),
        new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.5, metalness: 0.08 }),
        new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.45, metalness: 0.06 }),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5, metalness: 0.05 }),
        new THREE.MeshStandardMaterial({ color: 0xe2dfff, roughness: 0.35, metalness: 0.04 }),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.02 }),
      ];

      const cube = new THREE.Mesh(new THREE.BoxGeometry(2.35, 2.35, 2.35, 8, 8, 8), cubeMaterials);
      cube.castShadow = true;
      group.add(cube);

      const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(cube.geometry), edgeMaterial);
      group.add(edges);

      const orbitGroup = new THREE.Group();
      group.add(orbitGroup);

      const accentMaterial = new THREE.MeshStandardMaterial({
        color: 0x6cf8bb,
        roughness: 0.35,
        metalness: 0.06,
        transparent: true,
        opacity: 0.9,
      });
      const accentGeometry = new THREE.IcosahedronGeometry(0.22, 1);
      for (let i = 0; i < 8; i += 1) {
        const angle = (i / 8) * Math.PI * 2;
        const item = new THREE.Mesh(accentGeometry, accentMaterial);
        item.position.set(Math.cos(angle) * 3.1, Math.sin(angle) * 1.55, Math.sin(angle * 1.5) * 0.6);
        orbitGroup.add(item);
      }

      scene.add(new THREE.AmbientLight(0xffffff, 1.8));

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(4, 5, 6);
      scene.add(keyLight);

      const violetLight = new THREE.PointLight(0x4f46e5, 18, 8);
      violetLight.position.set(-3, 2, 3);
      scene.add(violetLight);

      const mintLight = new THREE.PointLight(0x10b981, 12, 7);
      mintLight.position.set(3, -2, 2);
      scene.add(mintLight);

      const pointer = { x: 0, y: 0 };
      const onPointerMove = (event: PointerEvent) => {
        const rect = mount.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 0.5;
        pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 0.5;
      };

      const resize = () => {
        const width = mount.clientWidth;
        const height = mount.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height || 1;
        camera.updateProjectionMatrix();
        group.position.x = width < 760 ? 0.35 : 1.65;
        group.position.y = width < 760 ? -2.15 : 0;
        group.scale.setScalar(width < 760 ? 0.68 : 1);
      };

      mount.addEventListener("pointermove", onPointerMove);
      window.addEventListener("resize", resize);
      resize();

      let frameId = 0;
      const clock = new THREE.Clock();
      const animate = () => {
        const elapsed = clock.getElapsedTime();
        cube.rotation.x = elapsed * 0.32 + pointer.y;
        cube.rotation.y = elapsed * 0.45 + pointer.x;
        edges.rotation.copy(cube.rotation);
        orbitGroup.rotation.z = elapsed * 0.22;
        orbitGroup.rotation.y = elapsed * 0.16;
        group.rotation.z = Math.sin(elapsed * 0.35) * 0.08;
        renderer.render(scene, camera);
        frameId = window.requestAnimationFrame(animate);
      };
      animate();

      cleanup = () => {
        window.cancelAnimationFrame(frameId);
        mount.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("resize", resize);
        cube.geometry.dispose();
        edges.geometry.dispose();
        accentGeometry.dispose();
        cubeMaterials.forEach((material) => material.dispose());
        edgeMaterial.dispose();
        accentMaterial.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-auto absolute inset-0"
      aria-hidden="true"
    />
  );
}
