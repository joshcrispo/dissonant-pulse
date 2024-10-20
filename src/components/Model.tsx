import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const Model = () => {
    const { scene } = useGLTF('/dp_3d.glb'); 
    const groupRef = useRef<THREE.Group>(null);
    const pivotRef = useRef<THREE.Group>(null);

    useEffect(() => {
        if (groupRef.current) {
            const box = new THREE.Box3().setFromObject(groupRef.current);
            const center = box.getCenter(new THREE.Vector3());
            groupRef.current.position.sub(center);

            groupRef.current.position.x += 1;
            groupRef.current.position.y -= 0.5;
            groupRef.current.position.z += 0.2;
        }

        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshStandardMaterial({ color: 'white' });
            }
        });
    }, [scene]);

    useFrame(() => {
        if (pivotRef.current) {
            pivotRef.current.rotation.y += 0.05;
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

export default Model;
