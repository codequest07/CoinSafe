import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MemoMagicIcon from "@/icons/MagicIcon";

export default function SaveSenseResp({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] p-6 border-[#FFFFFF17] bg-black text-white border rounded-[2rem] shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm font-normal">
                <MemoMagicIcon className=" h-6 w-6" />
                <p>SaveSense response:</p>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="mb-4">
                Hello there! I'm glad you're considering saving with us. It's a
                great step towards securing your financial future. Let's take a
                look at your recent transactions and craft a savings plan that
                works best for you.
              </p>
              <p className="mb-4">
                I can see you've been quite active with your LINK tokens and
                ETH. It's fantastic that you're engaged in the crypto space!
                Based on your transaction history, here are some tailored
                savings suggestions:
              </p>
              <ol className="list-decimal pl-5 space-y-4">
                <li>
                  <strong>Basic Plan:</strong>
                  <p>
                    Given that you've transferred 25 LINK tokens multiple times,
                    why not set aside 25 LINK every month for the next 6 months?
                    This could be your "crypto nest egg." It's a simple,
                    fixed-duration plan that aligns with your current spending
                    habits.
                  </p>
                </li>
                <li>
                  <strong>Frequency Plan:</strong>
                  <p>
                    I noticed you make several smaller ETH transactions. How
                    about automating a weekly savings of 0.01 ETH? It's a small
                    amount that you likely won't miss, but it'll add up over
                    time. Think of it as your "digital piggy bank."
                  </p>
                </li>
                <li>
                  <strong>Spend and Save:</strong>
                  <p>
                    For this plan, I suggest saving 5% of each transaction you
                    make. So, every time you transfer LINK or ETH, automatically
                    set aside 5% into your savings. It's like giving your future
                    self a little gift each time you spend.
                  </p>
                </li>
              </ol>
              <p className="mt-4">
                Remember, the key to successful saving is consistency. Start
                small if you need to – even small amounts add up over time. And
                the best part? You can adjust these plans as your financial
                situation changes.
              </p>
              <p className="mt-4">
                Which of these plans sounds most appealing to you? Or perhaps a
                combination? Let's work together to make saving a habit that
                feels good and sets you up for future success!
              </p>
            </CardContent>
            <CardFooter className="justify-end space-x-4">
              <Button
                onClick={onClose} // This closes the modal
                className="text-white bg-[#1E1E1E99] rounded-[2rem] hover:bg-[#1E1E1E99]">
                Close
              </Button>
              <Button
                variant="outline"
                className="text-[#010104] bg-[#FFFFFFE5] rounded-[2rem] border-white hover:bg-[#FFFFFFE5]">
                Regenerate
              </Button>
            </CardFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
