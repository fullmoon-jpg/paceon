import HouseRulesPage from "../ui/HouseRule";
import PaceNavbar from "../ui/navbar";
import CTASection from "../ui/CTAsectioon";
import PaceOnFooter from "../ui/footer";

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
                    <CTASection />
            </section>
            <footer id="Pace On Footer">
                <PaceOnFooter />
            </footer>
        </main>
    )
}