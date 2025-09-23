"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import BaseModal from "./components/BaseModal";

interface CardData {
    title: string;
    bgImage: string;
    bgColor: string;
}

interface ModalContent {
    title: string;
    sections: {
        image: string;
        subtitle: string;
        description: string;
    }[];
}

const GetToKnowUsSection: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const cards: CardData[] = [
        {
            title: "Game-Sport-Activity",
            bgImage: "/images/game-sport-activity.webp",
            bgColor: "bg-[#1d4a2d]",
        },
        {
            title: "Networking Session",
            bgImage: "/images/networking-session.webp",
            bgColor: "bg-[#1d4a2d]",
        },
        {
            title: "High Value Community",
            bgImage: "/images/high-value-community.webp",
            bgColor: "bg-[#1d4a2d]",
        },
        {
            title: "Real Connection in Making",
            bgImage: "/images/real-connection-making.webp",
            bgColor: "bg-[#1d4a2d]",
        },
    ];

    const modalContent: Record<string, ModalContent> = {
        "Game-Sport-Activity": {
            title: "Game-Sport-Activity",
            sections: [
                {
                image: "/images/gamesport-modal.webp",
                subtitle: "Breaking the Ice Through Play",
                description: "It starts with meeting people who feel familiar, not just in who they are but in the roles they play in life. On the court, titles and labels fade away. Sport becomes our way to break the ice, to laugh at missed shots, to celebrate small wins. It doesn't matter what your skill level is or which game you choose. What matters is moving your body, finding connection, and letting the stress slip away."
                },
            ]
        },
        "Networking Session": {
            title: "Networking Session",
            sections: [
                {
                image: "/images/networking-modal.webp",
                subtitle: "Conversations That Flow Naturally",
                description: "Sport is one of the best ways to break the ice and lift your mood. In those moments of happiness, it becomes easier to start a conversation and connect with the people around you. There is no pressure, no pitch, no sales prospect. What you find instead is a genuine bond between valuable individuals."
                },
            ]
        },
        "High Value Community": {
            title: "High Value Community",
            sections: [
                {
                image: "/images/highvalue-modal.webp",
                subtitle: "A Circle of Meaningful Connections",
                description: "Not everyone can join us at PACE ON, which means you’re guaranteed to meet highly valuable individuals within a truly meaningful community. This is not just another repetitive club. We make sure you feel engaged and genuinely connected with the people around you at PACE ON."
                },
            ]
        },
        "Real Connection in Making": {
            title: "Real Connection in Making",
            sections: [
                {
                image: "/images/realconnect-modal.webp",
                subtitle: "From Shared Moments to Lasting Bonds",
                description: "At PACE ON, we promise to create moments where you feel engaged, never awkward, and always at ease to connect. Real connections are not built on small talk or forced interactions, but on shared experiences and genuine encounters. When real eyes meet, walls come down and conversations flow naturally. That is when the energy of sport opens the door to something bigger, from laughter to collaboration to friendship. Here, you are not just part of a crowd. You are part of a community that values authenticity, where every interaction has the potential to spark something meaningful."
                },
            ]
        }
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % cards.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    };

    const getTranslateX = () => {
        return currentIndex * 468; // Only for desktop now
    };

    const translateX = getTranslateX();

    const renderModalContent = (content: ModalContent) => (
        <div className="space-y-8">
            {content.sections.map((section, index) => (
                <div key={index} className="space-y-6">
                    <div className="relative group">
                        <img
                            src={section.image}
                            alt={section.subtitle}
                            className="rounded-2xl shadow-lg object-cover w-full h-[70vh] aspect-[3/2] transition-transform duration-300"
                        />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xl font-bold text-black">{section.subtitle}</h3>
                        <p className="text-black leading-relaxed font-open-sans font-bold">
                            {section.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <section className="w-full py-8 sm:py-12 md:py-16 px-4 sm:px-8 md:px-16 lg:px-24 bg-gray-50">
            <div className="max-w-8xl mx-auto">
                {/* SEO Content - Hidden but accessible to search engines */}
                <div className="sr-only">
                    <h3>Game and Sport Activity</h3>
                    <p>Break the ice through games and sports where skill levels do not matter. Shared play helps build authentic connections.</p>
                    <h3>Networking Session</h3>
                    <p>Enjoy conversations that flow naturally after the game. There is no pressure or forced introductions, only genuine interactions.</p>
                    <h3>High Value Community</h3>
                    <p>Join a curated circle of founders and professionals. Every interaction offers the potential to grow into collaboration.</p>
                    <h3>Real Connection in Making</h3>
                    <p>Experience authentic encounters that go beyond small talk. Shared sports moments open the door to lasting bonds.</p>
                </div>

                {/* Section Title */}
                <div className="mb-8 sm:mb-10 md:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#1f4381] mb-4">
                        Get to know us
                    </h2>
                </div>

                {/* Cards Container */}
                <div className="relative bg-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12">
                    {/* Mobile & Tablet - Vertical Scroll with Larger Cards */}
                    <div className="lg:hidden">
                        <div className="overflow-y-auto max-h-[80vh] pb-4">
                            <div className="flex flex-col gap-6">
                                {cards.map((card, index) => (
                                    <div
                                        key={`mobile-tablet-${index}`}
                                        className={`relative w-full h-80 sm:h-96 rounded-2xl sm:rounded-3xl overflow-hidden ${card.bgColor} group cursor-pointer transform transition-all duration-300 hover:shadow-xl`}
                                        onClick={() => setActiveModal(card.title)}
                                    >
                                        <div
                                            className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-90 transition-opacity duration-300"
                                            style={{
                                                backgroundImage: `url(${card.bgImage})`,
                                                backgroundBlendMode: "multiply",
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                                        <div className="relative z-10 p-4 sm:p-5 h-full flex flex-col justify-between">
                                            <div className="flex justify-start">
                                                <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
                                                    {card.title}
                                                </h3>
                                            </div>
                                            <div className="flex justify-end">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/40 transition-all duration-300">
                                                    <Plus size={20} className="text-white sm:hidden" />
                                                    <Plus size={24} className="text-white hidden sm:block" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Scroll indicator for mobile/tablet */}
                        <div className="flex justify-center mt-4">
                            <p className="text-sm text-gray-500">↕ Scroll</p>
                        </div>
                    </div>

                    {/* Desktop - Horizontal Scroll */}
                    <div className="hidden lg:block">
                        <div className="overflow-x-auto pb-4">
                            <div className="flex gap-5" style={{ width: 'max-content' }}>
                                {cards.map((card, index) => (
                                    <div
                                        key={`desktop-${index}`}
                                        className={`relative w-2xl h-96 rounded-3xl overflow-hidden ${card.bgColor} group cursor-pointer transform transition-all duration-300 hover:shadow-xl flex-shrink-0`}
                                        onClick={() => setActiveModal(card.title)}
                                    >
                                        <div
                                            className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-90 transition-opacity duration-300"
                                            style={{
                                                backgroundImage: `url(${card.bgImage})`,
                                                backgroundBlendMode: "multiply",
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                                        <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                                            <div className="flex justify-end">
                                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/40 transition-all duration-300">
                                                    <Plus size={20} className="text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Scroll indicator for desktop */}
                        <div className="flex justify-center mt-4">
                            <p className="text-sm text-gray-500">← Slide →</p>
                        </div>
                    </div>
                </div>


            </div>

            {/* Single BaseModal - Conditionally Rendered */}
            {activeModal && (
                <BaseModal
                    isOpen={!!activeModal}
                    onClose={() => setActiveModal(null)}
                    title={modalContent[activeModal]?.title || activeModal}
                >
                    {renderModalContent(modalContent[activeModal])}
                </BaseModal>
            )}
        </section>
    );
};

export default GetToKnowUsSection;