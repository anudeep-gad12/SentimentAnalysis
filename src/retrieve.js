const AWS = require("aws-sdk");
const fs = require("fs");
AWS.config.update({
  region: "us-east-1",
});
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Function to scan the data from a DynamoDB table
async function scanTable(table_name) {
  const params = {
    TableName: "SentimentValues",
  };

  const data = await dynamodb.scan(params).promise();
  return data.Items;
}

// Function to save data to a JSON file
function saveDataToJson(data, file_path) {
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync("./sentiment.json", json);
}

async function main() {
  const tableName = "SentimentValues";
  const filePath = "./sentiment.json";

  const data = await scanTable(tableName);

  // Extract date and sentiment values
  const extractedData = data.map((item) => ({
    date: new Date(item.Date).toLocaleDateString(),
    sentiment: item.sentimentScore,
  }));

  extractedData.sort((a, b) => new Date(a.date) - new Date(b.date));

  saveDataToJson(extractedData, filePath);
}

main();
