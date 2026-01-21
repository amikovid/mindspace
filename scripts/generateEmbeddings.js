import 'dotenv/config';
import OpenAI from 'openai';
import { PCA } from 'ml-pca';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

// Cosine similarity function
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB);
}

// Find top N most similar items for each learning
function findTopSimilar(embeddings, topN = 3) {
  const similarities = [];

  for (let i = 0; i < embeddings.length; i++) {
    const sims = [];
    for (let j = 0; j < embeddings.length; j++) {
      if (i !== j) {
        const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
        sims.push({ index: j, similarity });
      }
    }
    // Sort by similarity descending and take top N
    sims.sort((a, b) => b.similarity - a.similarity);
    similarities.push(sims.slice(0, topN).map(s => s.index));
  }

  return similarities;
}

// Apply PCA to reduce dimensions to 3D
function pcaReduce3D(embeddings) {
  console.log('Applying PCA to reduce dimensions...');

  const pca = new PCA(embeddings);
  const reduced = pca.predict(embeddings, { nComponents: 3 });

  // Normalize to fit nicely in scene (-10 to +10 range)
  const coords = reduced.to2DArray();

  // Find min and max for each dimension
  const mins = [Infinity, Infinity, Infinity];
  const maxs = [-Infinity, -Infinity, -Infinity];

  for (const coord of coords) {
    for (let i = 0; i < 3; i++) {
      mins[i] = Math.min(mins[i], coord[i]);
      maxs[i] = Math.max(maxs[i], coord[i]);
    }
  }

  // Normalize to -10 to +10 range
  const normalized = coords.map(coord => {
    return coord.map((val, i) => {
      const range = maxs[i] - mins[i];
      return ((val - mins[i]) / range) * 20 - 10;
    });
  });

  return normalized;
}

async function main() {
  try {
    console.log('🌟 Starting embedding generation process...\n');

    // Load raw learnings
    const rawDataPath = path.join(__dirname, '..', 'src', 'data', 'learnings-raw.json');
    const rawLearnings = JSON.parse(fs.readFileSync(rawDataPath, 'utf-8'));
    console.log(`Loaded ${rawLearnings.length} learnings\n`);

    // Generate embeddings
    console.log('Generating embeddings from OpenAI...');
    const embeddings = [];

    for (let i = 0; i < rawLearnings.length; i++) {
      const learning = rawLearnings[i];
      console.log(`  ${i + 1}/${rawLearnings.length}: "${learning.text.substring(0, 40)}..."`);

      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: learning.text,
      });

      embeddings.push(response.data[0].embedding);

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('✓ Embeddings generated successfully\n');

    // Apply PCA for 3D positioning
    const positions = pcaReduce3D(embeddings);
    console.log('✓ PCA applied, 3D positions calculated\n');

    // Find similar learnings
    console.log('Calculating similarity relationships...');
    const similarities = findTopSimilar(embeddings, 3);
    console.log('✓ Similarities calculated\n');

    // Build processed data
    const processedData = rawLearnings.map((learning, i) => ({
      ...learning,
      position: {
        x: positions[i][0],
        y: positions[i][1],
        z: positions[i][2]
      },
      related: similarities[i].map(idx => rawLearnings[idx].id)
    }));

    // Save processed data
    const outputPath = path.join(__dirname, '..', 'src', 'data', 'learnings-processed.json');
    fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2));

    console.log('✓ Processed data saved to:', outputPath);
    console.log('\n🎉 Embedding generation complete!');
    console.log('\nSample output:');
    console.log(JSON.stringify(processedData[0], null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
