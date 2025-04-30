
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const inquiryFormSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

interface BatteryInquiryProps {
  batteryId: number;
  batteryTitle: string;
}

export default function BatteryInquiry({ batteryId, batteryTitle }: BatteryInquiryProps) {
  console.log("BatteryInquiry component rendering with props:", { batteryId, batteryTitle });
  const { user } = useAuth();
  console.log("User data in BatteryInquiry:", user);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      message: "",
    },
  });

  const onSubmit = async (data: InquiryFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to send an inquiry",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await apiRequest("POST", "/api/inquiries", {
        batteryId,
        message: data.message,
        contactEmail: user.email, // Use the logged-in user's email
      });

      toast({
        title: "Inquiry sent",
        description: "Your message has been sent to the battery owner",
      });

      form.reset();
    } catch (error) {
      console.error("Error sending inquiry:", error);
      toast({
        title: "Error",
        description: "Failed to send your inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Interested in this battery?</CardTitle>
          <CardDescription>Please log in to contact the seller</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Contact about this battery</CardTitle>
        <CardDescription className="text-xs">Send a message about "{batteryTitle}"</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="text-xs text-gray-500">
              You will be contacted at: <span className="font-medium">{user.email}</span>
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">Your message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="I'm interested in this battery. Can you provide more information about..." 
                      {...field}
                      rows={3}
                      className="resize-none text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-auto px-4"
                size="sm"
              >
                {isSubmitting ? "Sending..." : "Send Inquiry"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
