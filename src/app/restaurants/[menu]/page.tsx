import Navbar from "@/components/HomePage/Navbar";
import MenuPage from "@/components/Menu/menuPage";

const Page = async ({ params }: { params: { menu: string } }) => {
  const { menu } = await params;
  return (
    <>
      <Navbar />
      <MenuPage menu={menu} />
      <footer className="text-center py-4 bg-gray-100">
        <span>
          &copy; {new Date().getFullYear()} Slooze. All rights reserved.
        </span>
      </footer>
    </>
  );
};

export default Page;
