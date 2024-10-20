

# Ada

## Overview

**Ada** is more than just an infinite canvas—it's a creative hub designed for teams. With powerful AI-assisted image generation, adaptable dark mode, and multi-page navigation, **Ada** is perfect for brainstorming, designing, and collaborating. But the real magic? **Ada** transforms Discord calls into fully interactive, collaborative experiences, bringing creativity right into your team's favorite communication platform.

## Features

- **✨ Smart Shapes**: Create shapes that respond to scripting, constraints, and extended properties for a smarter canvas experience.
- **🌐 Infinite Canvas**: Sketch, write, and ideate without boundaries, with endless space for your projects.
- **📄 Multi-Page Support**: Manage multiple pages within the same project, keeping everything organized.
- **🖌️ Hand-Drawn Styles**: Add a personal touch to your designs with customizable hand-drawn styles.
- **🔗 Real-Time Collaboration**: Edit and create with your team simultaneously by sharing a room link.
- **📞 Discord Integration - Your Creative Studio in Discord**:
  - Bring **Ada** directly into your Discord calls, turning ordinary meetings into dynamic, creative sessions.
  - Launch **Ada** as a Discord activity, allowing your team to interact on the same canvas while chatting and strategizing in real-time.
  - Whether it's a brainstorming session, a design critique, or a project planning call, **Ada** transforms Discord into a shared creative workspace—no extra tabs or apps required.
  - With **real-time updates**, every line drawn, shape created, and text written is instantly visible to your collaborators, making team creativity as seamless as a voice conversation.
- **🌙 Dark Mode (Adaptive Colors)**: Ada automatically adapts to your system’s dark mode, adjusting all UI elements to ensure a comfortable viewing experience.
- **📤 Export to Image**: Easily export your canvas to PNG or SVG formats, preserving quality for presentations, documents, or further editing.
- **📝 Rich Text Support**: Add notes, labels, and formatted text directly onto the canvas.
- **📦 JSON Export/Import**: Save and reload entire projects with JSON export/import, keeping your workflows flexible and portable.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/malawadd/Ada.git
   cd Ada/discord-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000/
   ```

## Usage

1. **Generate AI Images**:
   - Open the input overlay from the toolbar.
   - Enter a prompt and select an AI model.
   - Press "Enter" or click "Generate" to create an image, which will appear on the canvas.

2. **Real-Time Collaboration**:
   - Click "Share" to generate a room link.
   - Share the link with others to collaborate on the same canvas in real-time.
   - Use the "Stop" button to end the sharing session.

3. **Discord Integration - The Game-Changer**:
   - **Launch Ada as a Discord Activity**: Start Ada directly within Discord during voice or video calls, turning the platform into a collaborative creative space.
   - **Zero Switch Time**: No more switching between apps—sketch ideas, brainstorm, and review designs with your team in the same window where you're communicating.
   - **Perfect for Team Creativity**: Whether you're a startup defining your brand, an artist collective collaborating on designs, or a product team mapping out user flows, Ada in Discord keeps everyone on the same page, literally.
   - **Real-Time Sync**: Every action on the canvas updates instantly for everyone in the call, making collaboration as easy as conversation.

4. **Multi-Page Navigation**:
   - Use the page navigation feature to move between different pages within your project.

5. **Export Options**:
   - Export your canvas to PNG or SVG by clicking the "Export" button in the toolbar.
   - Save your progress using the JSON export option and reload it later using the JSON import feature.

6. **Dark Mode**:
   - Ada automatically adapts to your system’s dark mode, changing UI elements to match the theme.

## Configuration

- **Livepeer API Integration**:
  - Set up your Livepeer API key in the `.env` file:
    ```env
    LIVEPEER_API_KEY=your_livepeer_api_key
    ```
  - Adjust model settings in the `livepeer.ts` file if needed.

- **Environment Variables**:
  - Create a `.env` file in the project root with the following variables:
    ```env
    DISCORD_CLIENT_ID=""
    VITE_DISCORD_CLIENT_ID=""
    DISCORD_CLIENT_SECRET="krlhVQ-"
    NODE_OPTIONS="--enable-source-maps"
    PORT="3000"
    ```
