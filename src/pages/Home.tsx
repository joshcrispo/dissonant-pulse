import React, { Suspense, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const Model = () => {
    const { scene } = useGLTF('/dp_3d.glb');
    const groupRef = useRef<THREE.Group>(null);
    const pivotRef = useRef<THREE.Group>(null);

    useEffect(() => {
        if (groupRef.current) {
            const box = new THREE.Box3().setFromObject(groupRef.current);
            const center = box.getCenter(new THREE.Vector3());
            groupRef.current.position.sub(center); // Center the model

            // Manually adjust the pivot point if needed
            groupRef.current.position.x += 1; // Adjust this value to change the pivot point
            groupRef.current.position.y -= 0.5; // Adjust this value to change the pivot point
            groupRef.current.position.z += 0.2; // Adjust this value to change the pivot point
        }
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshStandardMaterial({ color: 'white' }); // Change color here
            }
        });
    }, [scene]);

    useFrame(() => {
        if (pivotRef.current) {
            pivotRef.current.rotation.y += 0.05; // Adjust the speed of rotation here
        }
    });

    return (
        <group ref={pivotRef}>
            <group ref={groupRef}>
                <primitive object={scene} />
            </group>
        </group>
    );
};

const Home: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            <Helmet>
                <title>Dissonant Pulse - Home</title>
            </Helmet>
            <div className='mx-auto text-center w-9/12 max-w-9xl'>
                <div className="w-full h-96 mt-16">
                    <Canvas style={{ background: 'transparent' }} gl={{ alpha: true }}>
                        <ambientLight />
                        <pointLight position={[10, 10, 10]} />
                        <Suspense fallback={null}>
                            <Model />
                        </Suspense>
                        <PerspectiveCamera makeDefault position={[0, -100, 1000]} fov={55} />
                    </Canvas>
                </div>
                <h1 className="mx-auto mb-8 text-4xl font-bold">Welcome to Dissonant Pulse</h1>
                <p className="text-lg">Experience the latest and greatest in underground techno.</p>

                <section className="mt-16 mx-auto text-center max-w-3xl">
                    <h2 className="mt-24 text-2xl font-semibold">Upcoming Events</h2>
                    <ul className="my-8 space-y-2">
                        <li className="my-4 text-gray-400">Event 1: September 30, 2024 @ XYZ Club</li>
                        <li className="my-4 text-gray-400">Event 2: October 15, 2024 @ ABC Venue</li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default Home;
