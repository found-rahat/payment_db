import ProductList from "@/components/ProductList";

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <ProductList />
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
          <a
            href="/cart"
            className="bg-gray-600 text-center hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-full shadow-lg transition-colors duration-300 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l.586-1.172a2 2 0 012.156-1.173L10 11H16a1 1 0 00.8-1.6l-3-4a1 1 0 00-.8-.4H4.572a1 1 0 00-.71.29L1 8.04 2.29 6.75a1 1 0 01.71-.29zm5 7a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            Cart
          </a>
          <a
            href="/add-product"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-full shadow-lg transition-colors duration-300 flex items-center"
          >
            <span className="mr-2">+</span> Add Product
          </a>
        </div>
      </div>
    </>
  );
}
