export interface CodeSample {
	readonly id: string;
	readonly language: string;
	readonly title: string;
	readonly code: string;
}

export const codeSamples: readonly CodeSample[] = [
	{
		id: "c-hello",
		language: "C",
		title: "Hello World in C",
		code: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
	},
	{
		id: "java-hello",
		language: "Java",
		title: "Hello World in Java",
		code: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
	},
	{
		id: "go-hello",
		language: "Go",
		title: "Hello World in Go",
		code: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
	},
] as const;
