const fs = require("fs");
const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
});
const vader = require("vader-sentiment");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const arg = process.argv[2];

const newsApiKey = process.env.API_KEY;
let data = {};
// Function to fetch news data and save it to a local JSON file
async function fetchNewsData(arg) {
  try {
    const url = `https://newsapi.org/v2/everything?q=${arg}&from=2023-05-01&to=2023-01-01&apiKey=${newsApiKey}`;
    const response = await fetch(url);
    if (!response.ok) return;
    const responseData = await response.json();
    data = responseData;
  } catch (err) {
    console.log(err);
  }
}

const analyzeSentiment = async () => {
  const content = data.articles;
  for (let i = 0; i < content.length; i++) {
    const sentiment = vader.SentimentIntensityAnalyzer.polarity_scores(
      content[i].content
    );
    if (!content[i].sentiment) content[i].sentimentScore = sentiment;
    content[i].id = i + content[i].url;
  }
  fs.writeFileSync("news_data.json", JSON.stringify(data));
};

// Upload to DynamoDB
async function uploadToDynamoDB(article) {
  const params = {
    TableName: "SentimentValues",
    Item: {
      ID: article.id,
      Date: article.publishedAt,
      content: article.content,
      author: article.author,
      publisher: article.source.name,
      sentimentScore: article.sentimentScore.compound,
    },
  };

  try {
    await dynamoDB.put(params).promise();
    // console.log(`Uploaded article: ${article.url}`);
  } catch (error) {
    console.error("Error uploading the article:", error);
  }
}

function loadDataFromJson(file_path) {
  const data = fs.readFileSync(file_path, "utf-8");
  return JSON.parse(data).articles;
}

async function upload() {
  const filePath = "./news_data.json";
  const tableName = "SentimentValues";

  const articles = loadDataFromJson(filePath);
  for (const article of articles) {
    await uploadToDynamoDB(article, tableName);
  }
}

(async function () {
  await fetchNewsData(arg);
  await analyzeSentiment();
  await upload();
})();
