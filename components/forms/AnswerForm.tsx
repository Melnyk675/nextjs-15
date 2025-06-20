"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ReloadIcon } from "@radix-ui/react-icons";
import { MDXEditorMethods } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import { useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { AnswerSchema } from "@/lib/validations";
import { createAnswer } from "@/lib/actions/answer.action";
import { toast } from "@/hooks/use-toast";

const Editor = dynamic(() => import('@/components/editor'), {
    ssr: false
  });

interface Props {
    questionId: string;
    questionTitle: string;
    questionContent: string;
}

const AnswerForm = ({ questionId }: Props) => {
   const [isAnswering, startAnsweringTransition] = useTransition();

const editorRef = useRef<MDXEditorMethods>(null);

const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
        "content": "",
    }
  });

const handleSubmit =  async (values: z.infer<typeof AnswerSchema>) => {
   startAnsweringTransition(async () => {

   const result = await createAnswer({
     questionId,
     content: values.content,
   });

     if (result.success) {
       form.reset();

      toast({
        title: "Answer posted successfully",
        description: "Your answer has been posted successfully"
      });

      if (editorRef.current) {
        editorRef.current.setMarkdown("");
      }
    } else {
      toast({
        title: "Failed to post answer",
        description: result.error?.message,
        variant: "destructive"
      });
   }
  })
}

return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light800">
          Write your answer here
        </h4>
       
      </div>
      
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="mt-6 flex w-full flex-col gap-10"
      >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormControl className="mt-3.5">
                  <Editor
                    value={field.value}
                    editorRef={editorRef}
                    fieldChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" className="primary-gradient w-fit">
              {isAnswering ? (
                <>
                  <ReloadIcon className="mr-2 size-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Answer"
              )}
            </Button>
          </div>
      </form>
    </Form>
  </div>
  )
};

export default AnswerForm;