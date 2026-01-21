# Constellation of Wisdom 🌟

An interactive 3D visualization that displays personal learnings as stars in space, positioned based on semantic similarity. Explore connections between insights in a meditative, space-themed environment with generative audio.

## Features

- **3D Star Field**: 13 learnings rendered as glowing stars in 3D space
- **Semantic Positioning**: Stars positioned based on text similarity using OpenAI embeddings
- **Interactive Exploration**: Click stars to view details, discover related insights
- **Visual Connections**: Lines connecting semantically similar learnings
- **Ambient Audio**: Generative soundscape with Tone.js
- **Responsive Design**: Works on desktop and mobile

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up OpenAI API Key

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```
VITE_OPENAI_API_KEY=sk-your-api-key-here
```

**Getting an OpenAI API Key:**
1. Go to https://platform.openai.com/signup
2. Add a payment method (Billing → Add payment method)
3. Purchase credits (minimum $5, this project uses ~$0.01)
4. Create API key (API Keys → Create new secret key)

### 3. Generate Embeddings

Run the embedding generation script to process the learnings data:

```bash
npm run generate-embeddings
```

This will:
- Load the 13 learnings from `src/data/learnings-raw.json`
- Generate embeddings using OpenAI API
- Apply PCA to reduce dimensions to 3D coordinates
- Calculate similarity relationships
- Output processed data to `src/data/learnings-processed.json`

### 4. Run Development Server

```bash
npm run dev
```

Open your browser to the URL shown (usually `http://localhost:5173`)

## Usage

- **Orbit**: Click and drag to rotate the view
- **Zoom**: Scroll to zoom in/out
- **Select Star**: Click any star to view the learning detail
- **View Related**: Click related learnings in the detail panel to explore connections
- **Audio**: Toggle audio on/off with the button in the bottom-left corner

## Project Structure

```
Mindspace/
├── src/
│   ├── components/
│   │   ├── Scene.jsx              # Main Three.js scene
│   │   ├── StarField.jsx          # Renders all stars
│   │   ├── Star.jsx               # Individual star component
│   │   ├── DetailPanel.jsx        # Learning detail overlay
│   │   ├── AudioController.jsx    # Audio management
│   │   └── LoadingScreen.jsx      # Loading state
│   ├── data/
│   │   ├── learnings-raw.json          # Original learnings
│   │   └── learnings-processed.json    # Generated: embeddings + positions
│   ├── styles/
│   │   └── index.css              # Tailwind CSS
│   ├── App.jsx                    # Main app component
│   └── main.jsx                   # Entry point
├── scripts/
│   └── generateEmbeddings.js      # Embedding generation script
└── package.json
```

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool
- **Three.js** - 3D rendering
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Helpers for Three.js
- **@react-three/postprocessing** - Visual effects (bloom)
- **Tone.js** - Audio synthesis
- **Framer Motion** - UI animations
- **Tailwind CSS** - Styling
- **OpenAI API** - Text embeddings
- **ml-pca** - Dimensionality reduction

## Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your GitHub repository
4. Add environment variable: `VITE_OPENAI_API_KEY`
5. Deploy!

**Note**: The processed embeddings file (`learnings-processed.json`) is committed to the repo, so the OpenAI API key is only needed if you want to regenerate embeddings.

## Customization

### Adding New Learnings

1. Edit `src/data/learnings-raw.json`
2. Add your learning with this format:
```json
{
  "id": 14,
  "text": "Your learning here",
  "context": "Age, Gender, Profession"
}
```
3. Regenerate embeddings: `npm run generate-embeddings`
4. Restart dev server

### Adjusting Visual Style

- **Star size**: Edit `sphereGeometry args` in `src/components/Star.jsx`
- **Star color**: Modify `color` in `Star.jsx`
- **Background**: Change `background` in `src/components/Scene.jsx`
- **Glow intensity**: Adjust `Bloom` parameters in `Scene.jsx`

### Audio Customization

Edit `src/components/AudioController.jsx`:
- **Ambient notes**: Change `['C2', 'G2']` to different notes
- **Click sound duration**: Modify `'8n'` (eighth note) to other values
- **Reverb**: Adjust `decay` and `wet` parameters

## Troubleshooting

**"Audio autoplay blocked"**
- This is normal browser behavior. Click the prompt to enable audio.

**Embeddings script fails**
- Check your API key in `.env`
- Ensure you have credits in your OpenAI account
- Check network connection

**Stars not appearing**
- Make sure you ran `npm run generate-embeddings` first
- Check that `learnings-processed.json` exists

**Performance issues**
- Reduce bloom intensity in `Scene.jsx`
- Disable post-processing on mobile
- Reduce star count in `Stars` component

## License

MIT

## Credits

Built with Claude by Anthropic 🤖
