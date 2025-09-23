import PaceNavbar from "../ui/navbar";
import PaceOnFooter from "../ui/footer";
import ContactSection from "../ui/components/contact";

export default function ContactPage() {
    return(
        <main>
            <header>
                <PaceNavbar />
            </header>
            <section>
                <ContactSection />
            </section>
            <footer>
                <PaceOnFooter />
            </footer>
    </main>
    )
}