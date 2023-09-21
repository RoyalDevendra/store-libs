//The Global Variables
let libPrefix = "projectoid";
let API_URL = "https://api.projectoid.site/v1";

// Function to convert JSON to URL query string
function jTQS(jsonData) {
  var queryString = Object.keys(jsonData)
    .map(function (key) {
      return encodeURIComponent(key) + "=" + encodeURIComponent(jsonData[key]);
    })
    .join("&");
  return queryString;
}

//call connection with Projectoid
function apiCall(options) {
  if (!options) {
    throw "options not found";
    return;
  }
  let url = API_URL + "/" + options.path;
  if (options.method.toLowerCase() === "get") {
    url += "?" + jTQS(options.body);
  }
  let apiData = {
    url: url,
    headers: {
      ...(options.method.toLowerCase() === "get"
        ? {}
        : { "Content-Type": "application/json" }),
    },
    body: options.body,
    query: options.body,
    folow_redirects: true,
    completed_commands_count: 0,
    success: libPrefix + "onApiAnswer " + options.onSuccess,
    error: libPrefix + "onApiError",
  };

  // Check the method and use the corresponding HTTP function
  if (options.method.toLowerCase() === "get") {
    HTTP.get(apiData);
  } else if (options.method.toLowerCase() === "post") {
    HTTP.post(apiData);
  } else {
    throw "Unsupported HTTP method: " + options.method;
  }
}

//---------------------Broadcast Functions Starts----------------------------
//set projectoid access token
function saveToken(access_token) {
  if (!access_token) {
    throw "Error: Projectoid Access Token Not Found";
    return;
  }
  if (access_token.length != 32) {
    throw "Error: Projectoid Access Token is Wrong";
    return;
  }
  Bot.setProperty("Projectoid_AccessToken", access_token);
}

function addUser(userid, access_token) {
  if (isNaN(parseInt(userid))) {
    throw "incorrect user id";
    return;
  }

  if (!access_token) {
    var access_token = Bot.getProperty("Projectoid_AccessToken");
    if (!access_token) {
      throw "Error: Access Token Not Found";
      return;
    }
  }

  let data = {
    method: "post",
    path: "telegram/botpanel/adduser.php",
    body: {
      bot_id: bot.token.split(":")[0],
      user_id: userid,
      access_token: access_token,
    },
    onSuccess: null,
  };
  apiCall(data);
}

function broadcast(options) {
  if (!options) {
    Bot.sendMessage("options not found");
    return;
  }
  if (!options.method) {
    Bot.sendMessage("options not found");
    return;
  }
  if (options.method == "forwardBroadcast") {
    forwardBroadcast(options);
    return;
  }
  if (options.method == "copyBroadcast") {
    copyBroadcast(options);
    return;
  }

  Bot.sendMessage("*Starting broadcast...*");
  var text = !options.text ? null : options.text;
  var type = !options.type ? null : options.type;
  var file_id = !options.file_id ? null : options.file_id;
  var caption = !options.caption ? null : options.caption;
  var parseMode = !options.parseMode ? null : options.parseMode;
  var disableWebPreview = !options.disableWebPreview
    ? null
    : options.disableWebPreview;
  var protectContent = !options.protectContent ? false : options.protectContent;
  var webhookUrl = !options.webhookUrl ? null : options.webhookUrl;

  if (!options.access_token) {
    var access_token = Bot.getProperty("Projectoid_AccessToken");
    if (!access_token) {
      throw "Error: Bot Access Token Not Found";
      return;
    }
  }

  let data = {
    path: "telegram/botpanel/broadcast.php",
    method: "post",
    body: {
      bot: bot.name,
      bot_token: bot.token,
      access_token: access_token,
      admin: user.telegramid,
      method: options.method,
      text: text,
      type: type,
      file_id: file_id,
      caption: caption,
      parseMode: parseMode,
      disableWebPreview: disableWebPreview,
      protectContent: protectContent,
      webhookUrl: webhookUrl,
    },
    onSuccess: options.command,
  };
  apiCall(data);
}

function forwardBroadcast(options) {
  if (!options) {
    Bot.sendMessage("options not found");
    return;
  }
  var from_chat_id = options.from_chat_id;
  var message_id = options.message_id;

  if (!from_chat_id || !message_id) {
    Bot.sendMessage("chat id or message id was not found");
    return;
  }
  var protectContent = !options.protectContent ? false : options.protectContent;
  var webhookUrl = !options.webhookUrl ? null : options.webhookUrl;

  if (!options.access_token) {
    var access_token = Bot.getProperty("Projectoid_AccessToken");
    if (!access_token) {
      throw "Error: Bot Access Token Not Found";
      return;
    }
  }

  let data = {
    path: "telegram/botpanel/broadcast.php",
    method: "post",
    body: {
      access_token: access_token,
      bot_token: bot.token,
      admin: user.telegramid,
      method: "forwardMessage",
      from_chat_id: from_chat_id,
      message_id: message_id,
      protectContent: protectContent,
      webhookUrl: webhookUrl,
    },
    onSuccess: null,
  };
  Bot.sendMessage("*Starting broadcast...*");
  apiCall(data);
}

function copyBroadcast(options) {
  if (!options) {
    Bot.sendMessage("options not found");
    return;
  }
  var from_chat_id = options.from_chat_id;
  var message_id = options.message_id;

  if (!from_chat_id || !message_id) {
    Bot.sendMessage("chat id or message id was not found");
    return;
  }
  var protectContent = !options.protectContent ? false : options.protectContent;
  var webhookUrl = !options.webhookUrl ? null : options.webhookUrl;

  if (!options.access_token) {
    var access_token = Bot.getProperty("Projectoid_AccessToken");
    if (!access_token) {
      throw "Error: Bot Access Token Not Found";
      return;
    }
  }

  let data = {
    path: "telegram/botpanel/broadcast.php",
    method: "post",
    body: {
      access_token: access_token,
      bot_token: bot.token,
      method: "copyMessage",
      admin: user.telegramid,
      from_chat_id: options.from_chat_id,
      message_id: options.message_id,
      protectContent: protectContent,
      webhookUrl: webhookUrl,
    },
    onSuccess: null,
  };
  Bot.sendMessage("*Starting broadcast...*");
  apiCall(data);
}
//---------------------Broadcast Functions Ends------------------------------

function checkMembership(userId, chats, command) {
  if (!userId) {
    throw "Error: checkMembership: User id Not Found";
    return;
  }
  if (!chats) {
    throw "Error: checkMembership: Chat IDs Not Found";
    return;
  }
  if (!command) {
    throw "Error: checkMembership: command not found to return response";
    return;
  }

  let data = {
    path: "telegram/membership/index.php",
    method: "post",
    body: {
      token: bot.token,
      userId: userId,
      chatIds: chats,
    },
    onSuccess: command,
  };
  apiCall(data);
}

// Function called when an API answer is received
function onApiAnswer() {
  // Parse the content of the response, which is in JSON format
  let options = content;
  try {
    options = JSON.parse(options);
  } catch (error) {}

  if (!params || params === null || params === "null") {
  } else {
    Bot.runCommand(params, options);
  }
}

// Function called when an API request results in an error
function onApiError() {
  throw content + "\nGet Help at @ProjectoidChat";
}

publish({
  apiCall: apiCall,
  addUser: addUser,
  saveToken: saveToken,
  broadcast: broadcast,
  forwardBroadcast: forwardBroadcast,
  copyBroadcast: copyBroadcast,
  checkMembership: checkMembership,
});

on(libPrefix + "onApiAnswer", onApiAnswer);
on(libPrefix + "onApiError", onApiError);
