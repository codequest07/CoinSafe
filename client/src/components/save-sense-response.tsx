import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SaveSenseResponse() {
  return (
    <Card className=" bg-zinc-900 text-white">
      <CardHeader>
        <CardTitle className="flex items-center text-sm font-normal">
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          SaveSense response:
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <p className="mb-4">
          Hello there! I'm glad you're considering saving with us. It's a great
          step towards securing your financial future. Let's take a look at your
          recent transactions and craft a savings plan that works best for you.
        </p>
        <p className="mb-4">
          I can see you've been quite active with your LINK tokens and ETH. It's
          fantastic that you're engaged in the crypto space! Based on your
          transaction history, here are some tailored savings suggestions:
        </p>
        <ol className="list-decimal pl-5 space-y-4">
          <li>
            <strong>Basic Plan:</strong>
            <p>
              Given that you've transferred 25 LINK tokens multiple times, why
              not set aside 25 LINK every month for the next 6 months? This
              could be your "crypto nest egg." It's a simple, fixed-duration
              plan that aligns with your current spending habits.
            </p>
          </li>
          <li>
            <strong>Frequency Plan:</strong>
            <p>
              I noticed you make several smaller ETH transactions. How about
              automating a weekly savings of 0.01 ETH? It's a small amount that
              you likely won't miss, but it'll add up over time. Think of it as
              your "digital piggy bank."
            </p>
          </li>
          <li>
            <strong>Spend and Save:</strong>
            <p>
              For this plan, I suggest saving 5% of each transaction you make.
              So, every time you transfer LINK or ETH, automatically set aside
              5% into your savings. It's like giving your future self a little
              gift each time you spend.
            </p>
          </li>
        </ol>
        <p className="mt-4">
          Remember, the key to successful saving is consistency. Start small if
          you need to – even small amounts add up over time. And the best part?
          You can adjust these plans as your financial situation changes.
        </p>
        <p className="mt-4">
          Which of these plans sounds most appealing to you? Or perhaps a
          combination? Let's work together to make saving a habit that feels
          good and sets you up for future success!
        </p>
      </CardContent>
      <CardFooter className="justify-end space-x-4">
        <Button
          className="text-white bg-[#1E1E1E99] rounded-[2rem] hover:bg-[#1E1E1E99]">
          Close
        </Button>
        <Button
          variant="outline"
          className="text-[#010104] bg-[#FFFFFFE5] rounded-[2rem] border-white hover:bg-[#FFFFFFE5]">
          Regenerate
        </Button>
      </CardFooter>
    </Card>
  );
}
