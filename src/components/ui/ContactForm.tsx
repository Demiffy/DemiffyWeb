import { Card, CardContent } from './card';
import { Input } from './input';
import { Textarea } from './textarea';
import { Button } from './button';


const ContactForm = () => {
  return (
    <Card className="bg-slate-800 border-sky-500 overflow-hidden rounded-lg shadow-lg">
      <CardContent className="p-0">
        <div className="bg-slate-900 p-6 flex justify-between items-center">
          <h3 className="text-sky-400 font-bold text-lg">Contact Me!</h3>
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>
        <form className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="text-sky-400 block mb-2 text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              className="bg-slate-700 border-sky-500 text-white w-full py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              placeholder="Enter your name"
            />
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="text-sky-400 block mb-2 text-sm font-medium">
              Subject
            </label>
            <Input
              id="subject"
              className="bg-slate-700 border-sky-500 text-white w-full py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              placeholder="Enter the subject"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="text-sky-400 block mb-2 text-sm font-medium">
              Message
            </label>
            <Textarea
              id="message"
              className="bg-slate-700 border-sky-500 text-white w-full py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              rows={5}
              placeholder="Write your message"
            />
          </div>

          {/* Submit Button */}
          <Button className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 transition-colors">
            Send Message
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;
