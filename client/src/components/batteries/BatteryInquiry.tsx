
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const inquiryFormSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters"),
  contactEmail: z.string().email("Invalid email address").optional(),
});

type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

interface BatteryInquiryProps {
  batteryId: number;
  batteryTitle: string;
}

export default function BatteryInquiry({ batteryId, batteryTitle }: BatteryInquiryProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      message: "",
      contactEmail: user?.email || "",
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
        contactEmail: data.contactEmail,
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
      <Card>
        <CardHeader>
          <CardTitle>Interested in this battery?</CardTitle>
          <CardDescription>Please log in to contact the seller</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact about this battery</CardTitle>
        <CardDescription>Send a message about "{batteryTitle}"</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="I'm interested in this battery. Can you provide more information about..." 
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact email (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your@email.com" 
                      type="email" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Inquiry"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
