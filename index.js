global.fetch = require("node-fetch");
const https = require("https");
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
  Username: "u1@mailinator.com",
  Password: "Testing123**",
});

const userPool = new AmazonCognitoIdentity.CognitoUserPool({
  Region: "eu-west-1",
  UserPoolId: "eu-west-1_DcPqyOsN1",
  ClientId: "6lgqht332d7auc5o5mlsnalrtj",
  IdentityPoolId: "us-east-1:ceef8ccc-0a19-4616-9067-854dc69c2d82",
});

const userData = {
  Username: "u1@mailinator.com",
  Pool: userPool,
};

const gGNToSearchBy = "4052852912419";

var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
cognitoUser.authenticateUser(authenticationDetails, {
  onSuccess: function (result) {
    var accessToken = result.getIdToken().getJwtToken();
    https
      .get(
        {
          hostname: "api.ci.chain.agriplace.com",
          method: "GET",
          path: `/v2/partners/?is_archived=false&page=1&page_size=20&search=${gGNToSearchBy}&search_fields=partner__name%2Cpartner__ggn%2Cpartner__sedex%2Ccontacts__email`,
          headers: {
            "accept-encoding": "gzip, deflate, br",
            accept: "application/json, text/plain, */*",
            authorization: `JWT ${accessToken}`,
          },
        },
        (response) => {
          var str = "";

          //another chunk of data has been recieved, so append it to `str`
          response.on("data", function (chunk) {
            str += chunk;
          });

          //the whole response has been recieved, so we just print it out here
          response.on("end", function () {
            var body = JSON.parse(str);
            console.log(body);
          });
        }
      )
      .on("error", (err) => {
        console.log("Error: " + err.message);
      });
  },

  onFailure: function (err) {
    console.log(err.message || JSON.stringify(err));
  },
});
