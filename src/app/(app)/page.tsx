'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Autoplay from 'embla-carousel-autoplay';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const features = [
  {
    title: 'Chat with Hashnode Blogs',
    content:
      'Interact seamlessly with your favorite Hashnode blogs using our AI chat interface.',
  },
  {
    title: 'Powered by Hashnode GraphQL API',
    content:
      'Experience smooth and efficient data handling with our GraphQL API integration.',
  },
  {
    title: 'Import Blogs',
    content:
      'Easily import and access a wide range of blogs directly within the platform.',
  },
];

export default function Home() {
  return (
    <>
      {/* Main content */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col justify-center space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Interact with Hashnode Blogs
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Use our AI chat interface to interact with your favorite
                  Hashnode blogs. Ask questions, get answers, and learn more
                  about your favorite topics.
                </p>
              </div>
              <div className="flex flex-col bg-gray-100 p-4 rounded-md shadow-lg">
                <div className="flex-1 overflow-y-auto" />
                <div className="flex justify-center">
                  {/* Added for center alignment */}
                  <Carousel
                    plugins={[Autoplay({ delay: 2000 })]}
                    className="w-full max-w-lg md:max-w-xl"
                  >
                    <CarouselContent>
                      {features.map((feature, index) => (
                        <CarouselItem key={index} className="p-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p>{feature.content}</p>
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Input
                    className="flex-1"
                    placeholder="Type your message here..."
                    type="text"
                    readOnly
                  />
                  <Button>Send</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="text-center p-4 md:p-6">
        © 2023 HashTalk. All rights reserved.
      </footer>
    </>
  );
}
