package com.bookworm.seeder;

import com.bookworm.entity.Book;
import com.bookworm.entity.Coupon;
import com.bookworm.entity.User;
import com.bookworm.repository.BookRepository;
import com.bookworm.repository.CouponRepository;
import com.bookworm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-data:true}")
    private boolean seedData;

    @Override
    public void run(String... args) {
        if (!seedData) return;

        seedCoupons();
        seedUsers();
        seedBooks();

        log.info("✅  Data seeding complete. Books: {}, Users: {}, Coupons: {}",
                bookRepository.count(), userRepository.count(), couponRepository.count());
    }

    // ── Coupons ────────────────────────────────────────────────────

    private void seedCoupons() {
        if (couponRepository.count() > 0) return;

        couponRepository.saveAll(List.of(
                Coupon.builder().code("SAVE100").discountAmount(100).minOrderValue(499)
                        .description("Get ₹100 off on orders above ₹499").build(),
                Coupon.builder().code("WELCOME50").discountAmount(50).minOrderValue(199)
                        .description("Welcome discount of ₹50 on orders above ₹199").build(),
                Coupon.builder().code("BOOK200").discountAmount(200).minOrderValue(999)
                        .description("₹200 off on orders above ₹999").build()
        ));
        log.info("Seeded 3 coupons");
    }

    // ── Default User ───────────────────────────────────────────────

    private void seedUsers() {
        if (userRepository.existsByEmail("priya.sharma@example.com")) return;

        userRepository.save(User.builder()
                .name("Priya Sharma")
                .email("priya.sharma@example.com")
                .passwordHash(passwordEncoder.encode("demo123"))
                .role("REGISTERED")
                .giftPointsBalance(500)
                .build());
        log.info("Seeded demo user: priya.sharma@example.com / demo123");
    }

    // ── Books ──────────────────────────────────────────────────────

    private void seedBooks() {
        if (bookRepository.count() > 0) return;

        bookRepository.saveAll(List.of(

            // ── Self-help ──────────────────────────────────────────
            Book.builder()
                .title("Atomic Habits")
                .author("James Clear")
                .authorBio("James Clear is an author and speaker focused on habits, decision making, and continuous improvement.")
                .publisher("Penguin Random House")
                .format("Paperback").category("Self-help")
                .price(499).originalPrice(599)
                .rating(4.8).reviewCount(12450).copiesSold(85000)
                .coverImage("https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg")
                .tentativeDeliveryDays("2-4 days")
                .isBestseller(true).isRecommended(true)
                .description("No matter your goals, Atomic Habits offers a proven framework for improving every day.")
                .pages(320).language("English").isbn("9780735211292")
                .publishedDate("2018-10-16").build(),

            Book.builder()
                .title("The Psychology of Money")
                .author("Morgan Housel")
                .authorBio("Morgan Housel is a partner at The Collaborative Fund and a former columnist at The Motley Fool and The Wall Street Journal.")
                .publisher("Harriman House")
                .format("Paperback").category("Self-help")
                .price(349).originalPrice(399)
                .rating(4.7).reviewCount(9820).copiesSold(62000)
                .coverImage("https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg")
                .tentativeDeliveryDays("2-4 days")
                .isBestseller(true).isRecommended(true)
                .description("Timeless lessons on wealth, greed, and happiness doing well with money.")
                .pages(256).language("English").isbn("9780857197689")
                .publishedDate("2020-09-08").build(),

            Book.builder()
                .title("Deep Work")
                .author("Cal Newport")
                .authorBio("Cal Newport is a computer science professor at Georgetown University and the author of seven books.")
                .publisher("Grand Central Publishing")
                .format("Paperback").category("Self-help")
                .price(399)
                .rating(4.6).reviewCount(7340).copiesSold(45000)
                .coverImage("https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg")
                .tentativeDeliveryDays("3-5 days")
                .isRecommended(true)
                .description("Rules for focused success in a distracted world.")
                .pages(296).language("English").isbn("9781455586691")
                .publishedDate("2016-01-05").build(),

            // ── Fiction ────────────────────────────────────────────
            Book.builder()
                .title("The Silent Patient")
                .author("Alex Michaelides")
                .authorBio("Alex Michaelides is a British-Cypriot author and screenwriter.")
                .publisher("Celadon Books")
                .format("Paperback").category("Fiction")
                .price(329).originalPrice(399)
                .rating(4.5).reviewCount(8920).copiesSold(55000)
                .coverImage("https://covers.openlibrary.org/b/isbn/9781409181637-L.jpg")
                .tentativeDeliveryDays("2-4 days")
                .isBestseller(true)
                .description("A famous painter shoots her husband five times and then never speaks another word.")
                .pages(352).language("English").isbn("9781409181637")
                .publishedDate("2019-02-05").build(),

            Book.builder()
                .title("The Midnight Library")
                .author("Matt Haig")
                .authorBio("Matt Haig is a British author for children and adults. His memoir Reasons to Stay Alive was a number one bestseller.")
                .publisher("Canongate Books")
                .format("Paperback").category("Fiction")
                .price(299).originalPrice(349)
                .rating(4.4).reviewCount(6780).copiesSold(38000)
                .coverImage("https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg")
                .tentativeDeliveryDays("3-5 days")
                .isBestseller(true).isRecommended(true)
                .description("Between life and death there is a library, and within that library, the shelves go on forever.")
                .pages(304).language("English").isbn("9780525559474")
                .publishedDate("2020-09-29").build(),

            // ── Mystery ───────────────────────────────────────────
            Book.builder()
                .title("Gone Girl")
                .author("Gillian Flynn")
                .authorBio("Gillian Flynn is an American author and television critic. She is best known for her three novels.")
                .publisher("Crown Publishing")
                .format("Paperback").category("Mystery")
                .price(279)
                .rating(4.3).reviewCount(15200).copiesSold(72000)
                .coverImage("https://covers.openlibrary.org/b/isbn/9780307588364-L.jpg")
                .tentativeDeliveryDays("3-5 days")
                .isBestseller(true)
                .description("On a warm summer morning in North Carthage, Missouri, it is Nick and Amy Dunne's fifth wedding anniversary.")
                .pages(432).language("English").isbn("9780307588364")
                .publishedDate("2012-06-05").build(),

            // ── Romance ───────────────────────────────────────────
            Book.builder()
                .title("The Notebook")
                .author("Nicholas Sparks")
                .authorBio("Nicholas Sparks is an American novelist, screenwriter, and producer.")
                .publisher("Warner Books")
                .format("Paperback").category("Romance")
                .price(249)
                .rating(4.2).reviewCount(9100).copiesSold(48000)
                .coverImage("https://covers.openlibrary.org/b/isbn/9780446605236-L.jpg")
                .tentativeDeliveryDays("3-5 days")
                .isRecommended(true)
                .description("A story of a young couple from different social worlds who fall in love.")
                .pages(214).language("English").isbn("9780446605236")
                .publishedDate("1996-10-01").build(),

            // ── Biography ─────────────────────────────────────────
            Book.builder()
                .title("Steve Jobs")
                .author("Walter Isaacson")
                .authorBio("Walter Isaacson is a professor of history at Tulane and an author of biographies of Henry Kissinger, Benjamin Franklin, Albert Einstein, and Steve Jobs.")
                .publisher("Simon & Schuster")
                .format("Hardcover").category("Biography")
                .price(699).originalPrice(799)
                .rating(4.6).reviewCount(11300).copiesSold(60000)
                .coverImage("https://covers.openlibrary.org/b/isbn/9781451648539-L.jpg")
                .tentativeDeliveryDays("2-4 days")
                .isBestseller(true)
                .description("The exclusive biography of Steve Jobs, based on more than forty interviews.")
                .pages(656).language("English").isbn("9781451648539")
                .publishedDate("2011-10-24").build(),

            // ── Science Fiction ───────────────────────────────────
            Book.builder()
                .title("Dune")
                .author("Frank Herbert")
                .authorBio("Frank Herbert was an American science fiction author best known for the novel Dune and its five sequels.")
                .publisher("Chilton Books")
                .format("Paperback").category("Science Fiction")
                .price(449)
                .rating(4.7).reviewCount(13500).copiesSold(80000)
                .coverImage("https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg")
                .tentativeDeliveryDays("3-5 days")
                .isBestseller(true).isRecommended(true)
                .description("Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides.")
                .pages(688).language("English").isbn("9780441013593")
                .publishedDate("1965-08-01").build(),

            // ── New Launches ──────────────────────────────────────
            Book.builder()
                .title("The Joy of Minimalism")
                .author("Daniel Reed")
                .authorBio("Daniel Reed is a writer, minimalist, and productivity coach based in San Francisco.")
                .publisher("ABC Publishers")
                .format("Paperback").category("Self-help")
                .price(149).originalPrice(199)
                .rating(4.1).reviewCount(320).copiesSold(5000)
                .coverImage("")
                .tentativeDeliveryDays("3-5 days")
                .isNewLaunch(true)
                .description("Declutter your life to uncover peace, clarity, and joy.")
                .pages(180).language("English")
                .publishedDate("2025-01-15").build(),

            Book.builder()
                .title("The Vanishing House")
                .author("Clara Nelson")
                .authorBio("Clara Nelson is a bestselling thriller author with a knack for atmospheric mysteries.")
                .publisher("Harper Fiction")
                .format("eBook").category("Mystery")
                .price(99).originalPrice(149)
                .rating(4.0).reviewCount(210).copiesSold(3500)
                .coverImage("")
                .tentativeDeliveryDays("Instant")
                .isNewLaunch(true)
                .description("A chilling mystery unfolds within a house that disappears.")
                .pages(290).language("English")
                .publishedDate("2025-02-01").build(),

            Book.builder()
                .title("Path to Success")
                .author("James Wright")
                .authorBio("James Wright is a business coach and motivational speaker.")
                .publisher("Success Press")
                .format("Paperback").category("Self-help")
                .price(359).originalPrice(399)
                .rating(4.3).reviewCount(540).copiesSold(8000)
                .coverImage("")
                .tentativeDeliveryDays("3-5 days")
                .isNewLaunch(true).isRecommended(true)
                .description("A practical guide to achieving goals with clarity and confidence.")
                .pages(240).language("English")
                .publishedDate("2025-03-10").build()
        ));

        log.info("Seeded {} books", bookRepository.count());
    }
}
