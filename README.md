# TRIO Web App - User Guide

[Try an example here: Clean Text, Summarize Paragraph, Email Reply Generation, and Translate to French](https://trio.oopus.info/?task1=Clean%20Text&task2=Summarize%20Paragraph&task3=Email%20Reply%20Generation&input1=Now%20pile%20your%20dust%20upon%20the%20quick%20and%20dead,%0A%0ATill%20of%20this%20flat%20a%20mountain%20you%20have%20made,%0A%0ATo%20o'ertop%20old%20Pelion,40%20or%20the%20skyish%20head%0A%0AOf%20blue%20Olympus.%0A%0AHam.%20(Advancing.)%20What%20is%20he%20whose%20grief%0A%0ABears%20such%20an%20emphasis?—whose%20phrase%20of%20sorrow%0A%0A95%0AConjures%20the%20wand'ring%20stars,%20and%20makes%20them%20stand%0A%0ALike%20wonder-wounded%20hearers?—this%20is%20I,%0A%0AHamlet%20the%20Dane.%0A%0ALaer.%20(L.,%20leaping%20from%20the%20grave.)%20The%20devil%20take%20thy%20soul!&ext_url=https://www.deepl.com/en/translator%23en/fr/) - This link demonstrates how the app can clean text, summarize a paragraph, generate an email reply, and send the final output to DeepL for translation into French, showcasing the sequential workflow and the capabilities of TRIO Web App. Click the "Run All" button to try it..

## Website

https://trio.oopus.info

## Overview

Welcome to the TRIO Web App, a tool designed to help you perform multiple tasks on text using AI-driven models. This app allows you to run tasks such as text rewriting, cleaning, summarization, and more, either sequentially or individually. You can also send task results to an external API if needed. In this project, I use WebLLM, which can download LLM models locally and run them in the browser.

## How to Use the App

### Main Features

1. **Three Task Sections**: The app consists of three sections where you can input text and select a task for each section. The output from one task can automatically feed into the next, enabling smooth transitions between tasks.
2. **Task Selection**: For each section, you can choose a specific task from a list of predefined options such as "Neutral Rewrite," "Clean Text," and more.
3. **External API Integration**: You can send the output of the third task to an external API by providing the API URL.
4. **Copy Task Details**: Copy the task details and their results, along with URL parameters, to share with others or save for later use.

### Step-by-Step Instructions

#### Step 1: Input Text
Each of the three sections allows you to input text to be processed by a selected task.

1. **Task 1**: Start by typing or pasting text into the Task 1 input box. This is the text that will be processed by the first task.
2. **Task 2**: If enabled, the output of Task 1 will automatically be used as the input for Task 2. You can manually adjust this input if needed.
3. **Task 3**: Similarly, the output of Task 2 will automatically be fed into Task 3, unless you modify it.

#### Step 2: Select Tasks
For each section, you can choose from a list of tasks by clicking the "Show Task List" button. The available tasks include:

- **Clean Text**: Corrects grammar, punctuation, and formatting issues.
- **Email Reply Generation**: Generates a polite and professional email reply based on the provided input.
- **Expand Paragraph**: Expands a short paragraph by adding more details and context.
- **Expand Paragraph with Wikipedia**: Enhances a short paragraph by incorporating additional information from Wikipedia to provide more details and context.
- **Neutral Rewrite**: Rewrites the input text in a neutral tone.
- **Positive Rewrite**: Rewrites the input text in a positive and encouraging tone, emphasizing strengths and optimism
- **Redo Previous Cell**: Repeats the task from the previous section with updated input.
- **Summarize Paragraph**: Condenses the text into a shorter version while maintaining its core message.

Once you've selected a task, click "Run Task" for each section to execute the task.

#### Step 3: Run All Tasks
Once you've set up the tasks and input for all three sections, click the "Run All" button to process the text across all tasks sequentially.

#### Step 4: Use External API (Optional)
If you'd like to send the result of Task 3 to an external API, follow these steps:
1. Check the "Jump to External API Using Task 3 Output" checkbox.
2. Enter your API URL in the provided field.
3. After Task 3 is processed, the output will be sent to your API in a new browser tab.

#### Step 5: Copy Tasks
After completing the tasks, click the "Copy Tasks" button to copy the task selections and text inputs to your clipboard. This makes it easy to share your results or store the task configuration for later use.

## Additional Features

- **Automatic Focus**: The app automatically focuses on the Task 1 input field when you load the page.
- **Highlight Active Task**: The currently active task section is highlighted to guide your workflow.
- **URL Parameters**: The app can accept task configurations through URL parameters. If a URL contains task details, they will be automatically populated in the app.

### FAQ

#### How do I run tasks individually?
To run a task individually, select the task and click the "Run Task" button in the corresponding section.

#### What if I only want to use one or two tasks?
You can use as many or as few tasks as you like. Simply leave the other sections blank or select "No Task" from the task list.

#### Can I reuse the same task across multiple sections?
Yes, you can select the same task in multiple sections if needed.

#### What is the maximum input length for each task?
Each task section allows for a maximum input length of 3,000 characters.

## Acknowledgements

Special thanks to **[MerakDipper](https://github.com/MerakDipper)** for the insightful suggestions that inspired the workflow of this application.

This project uses **[Next.js](https://nextjs.org/)** for the web framework and **[WebLLM](https://webllm.mlc.ai/)** for AI-powered text processing. The app is currently hosted and running on **[Vercel](https://vercel.com/)**. For the AI model, the app currently utilizes **[Qwen2.5-1.5B](https://huggingface.co/Qwen/Qwen2.5-1.5B)** for production.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have further questions, feel free to reach out to the support team for assistance.
