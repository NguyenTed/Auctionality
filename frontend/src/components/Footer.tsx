import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";

const Footer = () => {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Top links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <FooterColumn
            title="About Catawiki"
            links={[
              "About Catawiki",
              "Our experts",
              "Careers",
              "Press",
              "Partnering with Catawiki",
              "Collectors' portal",
            ]}
          />

          <FooterColumn
            title="Buy"
            links={[
              "How to buy",
              "Buyer Protection",
              "Catawiki Stories",
              "Buyer terms",
            ]}
          />

          <FooterColumn
            title="Sell"
            links={[
              "How to sell",
              "Seller Tips",
              "Submission guidelines",
              "Seller terms",
              "Affiliates",
            ]}
          />

          <FooterColumn
            title="My Catawiki"
            links={["Sign in", "Register", "Help Centre"]}
          />
        </div>

        {/* Bottom area */}
        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Language */}
          <div className="flex items-center gap-2 border rounded-md px-4 py-2 cursor-pointer hover:border-primary">
            <LanguageIcon fontSize="small" />
            <span className="text-sm">English</span>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <FacebookIcon className="cursor-pointer hover:text-primary" />
            <InstagramIcon className="cursor-pointer hover:text-primary" />

            {/* Catawiki-style blue square */}
            <div className="h-8 w-8 bg-primary flex items-center justify-center rounded-sm cursor-pointer">
              <span className="text-white font-bold">C</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

/* ===================== */

const FooterColumn = ({ title, links }: { title: string; links: string[] }) => {
  return (
    <div>
      <h4 className="mb-4 font-semibold">{title}</h4>
      <ul className="space-y-2 text-gray-600">
        {links.map((link) => (
          <li key={link} className="cursor-pointer hover:text-primary">
            {link}
          </li>
        ))}
      </ul>
    </div>
  );
};
