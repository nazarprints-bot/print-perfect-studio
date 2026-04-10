import { MessageCircle } from "lucide-react";

const WhatsAppFloat = () => {
  return (
    <a
      href="https://wa.me/918962930650"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] rounded-full flex items-center justify-center shadow-lg shadow-black/20 hover:scale-110 transition-all duration-300 animate-bounce-subtle"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7 text-white fill-white" />
    </a>
  );
};

export default WhatsAppFloat;
