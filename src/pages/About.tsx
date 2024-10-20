import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Helmet } from 'react-helmet';
import Model from '../components/Model';
import { PerspectiveCamera } from '@react-three/drei';

const About: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isVisibleValues, setIsVisibleValues] = useState(false);
    const [isVisibleVision, setIsVisibleVision] = useState(false);
    const [isVisibleProjects, setIsVisibleProjects] = useState(false);
    const [isVisibleInvolved, setIsVisibleInvolved] = useState(false);

    const aboutRef = useRef<HTMLDivElement | null>(null);
    const valuesRef = useRef<HTMLDivElement | null>(null); 
    const visionRef = useRef<HTMLDivElement | null>(null);
    const projectsRef = useRef<HTMLDivElement | null>(null);
    const involvedRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );

        if (aboutRef.current) {
            observer.observe(aboutRef.current);
        }

        return () => {
            if (aboutRef.current) {
                observer.unobserve(aboutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const valuesObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisibleValues(true);
                    valuesObserver.disconnect();
                }
            },
            { threshold: 0.2 }
        );

        if (valuesRef.current) {
            valuesObserver.observe(valuesRef.current);
        }

        return () => {
            if (valuesRef.current) {
                valuesObserver.unobserve(valuesRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const visionObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisibleVision(true);
                    visionObserver.disconnect();
                }
            },
            { threshold: 0.2 }
        );

        if (visionRef.current) {
            visionObserver.observe(visionRef.current);
        }

        return () => {
            if (visionRef.current) {
                visionObserver.unobserve(visionRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const projectsObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisibleProjects(true);
                    projectsObserver.disconnect();
                }
            },
            { threshold: 0.2 }
        );

        if (projectsRef.current) {
            projectsObserver.observe(projectsRef.current);
        }

        return () => {
            if (projectsRef.current) {
                projectsObserver.unobserve(projectsRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const involvedObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisibleInvolved(true);
                    involvedObserver.disconnect();
                }
            },
            { threshold: 0.2 }
        );

        if (involvedRef.current) {
            involvedObserver.observe(involvedRef.current);
        }

        return () => {
            if (involvedRef.current) {
                involvedObserver.unobserve(involvedRef.current);
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            <Helmet>
                <title>Dissonant Pulse - About</title>
            </Helmet>

            {/* About Us Section */}
            <div className="flex flex-col md:flex-row justify-between items-center p-4 w-9/12 max-w-9xl" ref={aboutRef}>
                <div className={`about-section w-full md:w-1/2 ${isVisible ? 'fade-in-active' : 'fade-in'}`}>
                    <h1 className="text-4xl font-bold mb-4">About Us</h1>
                    <p className="text-lg mb-4">
                        Dissonant Pulse is dedicated to crafting immersive experiences through music and art. Our mission is to bring together diverse sounds and visual elements to create a transformative journey for our audience.
                    </p>
                    <p className="text-lg mb-4">
                        We believe in the power of creativity and the ability to connect people through art. Join us as we explore the intersection of sound and vision.
                    </p>
                </div>

                {/* 3D Model Section */}
                <div className="w-full md:w-1/2 h-96 mt-16">
                    <Canvas style={{ background: 'transparent' }} gl={{ alpha: true }}>
                        <ambientLight />
                        <pointLight position={[10, 10, 10]} />
                        <Suspense fallback={null}>
                            <Model />
                        </Suspense>
                        <PerspectiveCamera makeDefault position={[0, -100, 1000]} fov={55} />
                    </Canvas>
                </div>
            </div>

            {/* Our Values Section */}
            <div
                ref={valuesRef}
                className={`about-section p-4 w-9/12 max-w-9xl ${isVisibleValues ? 'fade-in-active' : 'fade-in'}`}>
                <h2 className="text-3xl font-semibold mb-4">Our Values</h2>
                <p className="text-lg mb-4">
                    We prioritize creativity, collaboration, and community engagement. Our team is passionate about pushing boundaries and exploring new artistic avenues.
                </p>
            </div>

            {/* Our Vision Section */}
            <div
                ref={visionRef}
                className={`about-section p-4 w-9/12 max-w-9xl ${isVisibleVision ? 'fade-in-active' : 'fade-in'}`}>
                <h2 className="text-3xl font-semibold mb-4">Our Vision</h2>
                <p className="text-lg mb-4">
                    Our vision is to create a world where music and art converge to inspire and uplift individuals, fostering a sense of community through shared experiences.
                </p>
                <p className="text-lg mb-4">
                    We aim to break down barriers between different art forms and invite everyone to participate in the creative journey.
                </p>
            </div>

            {/* Past Projects Section */}
            <div
                ref={projectsRef}
                className={`about-section p-4 w-9/12 max-w-9xl ${isVisibleProjects ? 'fade-in-active' : 'fade-in'}`}>
                <h2 className="text-3xl font-semibold mb-4">Past Projects</h2>
                <p className="text-lg mb-4">
                    Over the years, Dissonant Pulse has collaborated with various artists and organizations to produce unforgettable experiences, including:
                </p>
                <ul className="list-disc list-inside mb-4">
                    <li>Live music and visual art installations</li>
                    <li>Interactive workshops blending sound and imagery</li>
                    <li>Community-driven events celebrating creativity</li>
                </ul>
            </div>

            {/* Get Involved Section */}
            <div
                ref={involvedRef}
                className={`about-section p-4 w-9/12 max-w-9xl ${isVisibleInvolved ? 'fade-in-active' : 'fade-in'}`}>
                <h2 className="text-3xl font-semibold mb-4">Get Involved</h2>
                <p className="text-lg mb-4">
                    We welcome artists, musicians, and creators of all backgrounds to join our community. Whether through collaborations, events, or workshops, there are many ways to get involved!
                </p>
                <p className="text-lg mb-4">
                    Stay connected by following us on our social media platforms and subscribing to our newsletter for updates on upcoming projects and events.
                </p>
            </div>
        </div>
    );
};

export default About;
