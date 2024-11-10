const textualContent = document.body.innerText;
const url = window.location.href;
const date = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

const data = {
  url,
  content: textualContent,
  date,
};

chrome.storage.local.get(["uuid"], function (result) {
  if (result.uuid) {
    
    fetch("https://resolute-land-440916-q3.el.r.appspot.com/ext/tracktext", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({uuid: result.uuid, content: data}),
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log("Textual data sent successfully:", responseData);
      })
      .catch((error) => {
        console.error("Error sending textual data:", error);
      });
  } else {
    console.log("User ID not found in local storage.");
  }
});
