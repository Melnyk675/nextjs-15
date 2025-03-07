"use client";

import { useForm } from 'react-hook-form';
import dynamic from 'next/dynamic';
import React, { useRef, useTransition } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MDXEditorMethods } from '@mdxeditor/editor';
import { ReloadIcon } from "@radix-ui/react-icons";

import { AskQuestionSchema } from '@/lib/validations';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import TagCard from '../cards/TagCard';
import { createQuestion } from '@/lib/actions/question.action';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import ROUTES from '@/constants/routes';

const Editor = dynamic(() => import('@/components/editor'), {
    ssr: false
  })

const QuestionForm = () => {
   const router = useRouter();
   const editorRef = useRef<MDXEditorMethods>(null);
   const [isPending, startTransition] = useTransition();

   const form = useForm<z.infer<typeof AskQuestionSchema>>({
      resolver: zodResolver(AskQuestionSchema),
      defaultValues: {
        title: "",
        content: "",
        tags: [],
      },
   });

   const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, 
    field: { value: string[] } 
) => {
       if (e.key === "Enter") {
         e.preventDefault();
         const tagInput = e.currentTarget.value.trim();

         if (tagInput && tagInput.length < 15 && !field.value.includes(tagInput)) {
            form.setValue("tags", [...field.value, tagInput]);
            e.currentTarget.value = "";
            form.clearErrors("tags");
        } else if (tagInput.length > 15) {
            form.setError("tags", {
              type: "manual",
              message: "Tag should be less than 15 characters",
            });
          } else if (field.value.includes(tagInput)) {
            form.setError("tags", {
              type: "manual",
              message: "Tag already exists",
            });
          }
       }
   };

  const handleTagRemove = (tag: string, field: {value: string[] }) => {
    const newTags = field.value.filter((t) => t !== tag);

    form.setValue("tags", newTags);

    if (newTags.length === 0) {
      form.setError("tags", {
        type: "manual",
        message: "Tags are required",
      });
    }
  };

  const handleCreateQuestion = async (
    data: z.infer<typeof AskQuestionSchema>
  ) => {
    startTransition(async () => {
      const result = await createQuestion(data);

    if (result.success) {
      toast({
        title: "Success",
        description: "Question created successfully"
      });

      if (result.data) router.push(ROUTES.QUESTION(result.data._id));
    } else {
      toast({
        title: `Error ${result.status}`,
        description: result.error?.message || "Failed to create question",
        variant: "destructive",
      });
     } 
    });
  };

  return <Form {...form}>
     <form 
       className='flex flex-col w-full gap-10'
       onSubmit={form.handleSubmit(handleCreateQuestion)}
     >
      <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
             <FormLabel className="paragraph-semibold 
              text-dark400_light800">
                Question Title <span className='text-primary-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  className="paragraph-regular
                  background-light700_dark300 light-border-2
                  text-dark300_light700 no-focus min-h-[56px]
                  border"
                  {...field} 
                 />
              </FormControl>
              <FormDescription className='body-regular
               text-light-500 mt-2.5'>
                Be specific and imagine you’re asking a question to another person.
              </FormDescription>
             <FormMessage />
            </FormItem>
           )}
          />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
             <FormLabel className="paragraph-semibold 
              text-dark400_light800">
                Detailed explanation of your problem{" "}
                <span className='text-primary-500'>*</span>
              </FormLabel>
              <FormControl>
                <Editor 
                  value={field.value}
                  editorRef={editorRef} 
                  fieldChange={field.onChange}
                />
              </FormControl>
              <FormDescription className='body-regular
               text-light-500 mt-2.5'>
                 Introduce the problem and expand on what you put in the title.
              </FormDescription>
             <FormMessage />
            </FormItem>
           )}
          />
         <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
             <FormLabel className="paragraph-semibold 
              text-dark400_light800">
                Tags <span className='text-primary-500'>*</span>
              </FormLabel>
              <FormControl>
                <div>
                 <Input 
                   className="paragraph-regular
                   background-light700_dark300 light-border-2
                   text-dark300_light700 no-focus min-h-[56px]
                   border"
                   placeholder="Add tags..."
                   onKeyDown={(e) => handleInputKeyDown(e, field)}
                  />
                  {field.value.length > 0 && (
                  <div className='flex-start flex-wrap mt-2.5 gap-2.5'>
                    {field?.value?.map((tag: string) => 
                    <TagCard
                     key={tag}
                     _id={tag}
                     name={tag}
                     compact
                     remove
                     isButton
                     handleRemove={() => handleTagRemove(tag, field)}
                    />)}
                  </div>
            )}
                </div>
              </FormControl>
              <FormDescription className='body-regular
               text-light-500 mt-2.5'>
                Add up to 3 tags to describe what your question is about. You need to press Enter to add a tag.
              </FormDescription>
             <FormMessage />
            </FormItem>
           )}
          />

          <div className='mt-16 flex justify-end'>
            <Button 
              type="submit"
              disabled={isPending} 
              className='primary-gradient !text-light-900 w-fit'
             >
                {isPending ? (
                  <>
                    <ReloadIcon className='mr-2 size-4 animate-spin' />
                    <span>Submitting</span>
                  </>
                ) : (
                  <>Ask a question</>
                )}
            </Button>
          </div>
       </form>
    </Form>
  };

export default QuestionForm;