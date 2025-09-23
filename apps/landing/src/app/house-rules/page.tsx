import HouseRulesPage from "../ui/HouseRule";
import PaceNavbar from "../ui/navbar";
import PaceOnCTASection from "../ui/CTAsectioon";
import PaceOnFooter from "../ui/footer";
import FadeInSection from "@paceon/ui/FadeIn";

export default function HouseRule() {
    return (
        <main className="bg-white">
            <header id="Pace On Navbar">
                <PaceNavbar />
            </header>
            <section id="House Rules">
                    <HouseRulesPage />
            </section>
            <section id="CTA Section">
                <FadeInSection id="Call to Action" delay={0.2}>
                    <PaceOnCTASection />
                </FadeInSection>
            </section>
            <footer id="Pace On Footer">
                <PaceOnFooter />
            </footer>
        </main>
    )
}