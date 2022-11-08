# [Citrus V3](https://citrus.financial)

#### Development Environment/Tools
![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-%20-blue?style=for-the-badge&logo=visual-studio-code&logoColor=white&color=007acc) ![GitHub](https://img.shields.io/badge/Github-%20-blue?style=for-the-badge&logo=github&logoColor=white&color=181717) ![React](https://img.shields.io/badge/React-%20-blue?style=for-the-badge&logo=react&logoColor=white&color=61dafb) ![Node.js](https://img.shields.io/badge/NodeJs-%20-blue?style=for-the-badge&logo=node.js&logoColor=white&color=339933) ![Git](https://img.shields.io/badge/git-%20-blue?style=for-the-badge&logo=git&logoColor=white&color=F05032)

#### Databse Deployment/Management
![Google Firestore](https://img.shields.io/badge/Firebase-%20-blue?style=for-the-badge&logo=firebase&logoColor=white&color=ffca28)

#### Development Languages
![JavaScript](https://img.shields.io/badge/JavaScript-%20-blue?style=for-the-badge&logo=javascript&logoColor=white&color=f7df1e) ![CSS3](https://img.shields.io/badge/CSS3-%20-blue?style=for-the-badge&logo=css3&logoColor=white&color=1572b6) ![SASS](https://img.shields.io/badge/sass-%20-blue?style=for-the-badge&logo=sass&logoColor=white&color=cc6699) ![HTML5](https://img.shields.io/badge/HTML5-%20-blue?style=for-the-badge&logo=html5&logoColor=white&color=e34f26)

## Meet Development Team

### Lead Software Developer ([Joe Dobbelaar](https://github.com/r2pen2))
Something about the two of us...

# Developer Manual

### Recommended Extensions (VSC)
Here's a list of extensions that I recommend installing:
- [Tabnine](https://marketplace.visualstudio.com/items?itemName=TabNine.tabnine-vscode) is the shit. AI generated autocomplete that learns from you. This will save you so much time.
- [Simple React Snippets](https://marketplace.visualstudio.com/items?itemName=burkeholland.simple-react-snippets) Auto-generate React code with shortcuts.
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) Basic code formatter.
- [Git Graph](https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph) View a Git Graph of your repository, and perform Git actions from the graph.
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) Integrates ESLint JavaScript into VS Code.
- [ES7+ React/Redux/React Native Snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets) React snippets that integrate with Prettier.

### Best Practices

##### File Types
Server files are written as .js.

If you're writing a React component, make it a .jsx file! .js will compile just fine, but the styling is a little less friendly.

HTML styling should be written in SASS, rather than CSS. .scss files are easily importable and more readable.

##### File System
As a general rule, the file system should be kept as "modular" as possible. For example, components referenced by App.jsx go in src/components, but components only referenced by Login.jsx are kepy in src/components/login. Assets follow the same rule (src/assets has global assets. src/components/topbar/assets has assets only used by Topbar.jsx).

##### Comment your code!
Try to make it really clear what it is that you're doing. Even code that you wrote 6 months ago can feel totally foreign without proper documentation.
Follow this guide to creating function signatures.
Shortcut: typing "/**" one line above a function and hitting enter will auto-generate a signature template.
```js
/**
* Multiply two numbers together
* @param x {Number} the first number
* @param y {Number} the second number
* @returns {Number} the product of x and y
*/
function multiplyTwoNumbers(x, y) {
    return x * y;
}
```

##### Document! Document! Document!
Write out what you're doing in README.md so that anyone else can (hopefully) look up whatever they need.

### Give Yourself Credit
Write your name at the top of files and functions that you create. If something is wrong or someone has a question, they'll know who to go to.

##### Write Tests
Server tests and client tests are written differently, but are both run whenever changes are made to the master branch or a pull request is created into master. Pull requests that pass tests are more likely to be merged.

It's also best to write tests whenever you create a new function (within reason, of course).

##### Function Scopes
Try to keep helper functions inside their parents. This makes it more clear what each function is used for and makes it easier to collapse code :)

## Client Manual

### Routing
Routes work like a switch statement that returns a component based on the current window.location. Components outside the Routes tag will not be effected by the url.

Take a look at how routing works in Login.jsx:
```jsx
<Routes>
  <Route path="*" element={<PhoneInput />}/>
  <Route path="/phone-number" element={<PhoneInput />}/>
  <Route path="/authentication/*" element={<Authentication setUserById={setUserById}/>}/>
  <Route path="/account-creation" element={<NewUserForm setUserById={setUserById}/>}/>
</Routes>
```

Take note of the asterisk after /authentication. This means that there are more routes contained within /authentication. Forgetting to add the asterisk in the parent route will 
```js
<Route path="/authentication/*" element={<Authentication setUserById={setUserById}/>}/>
```
And inside the Authentication component...
```js
<Routes>
    <Route path="/" element={<AuthCodeInput />} />
    <Route path="/check-auth" element={<AuthCodeInput />} />
    <Route path="/fetch-user" element={<FetchUser />} />
    <Route path="/password-entry" element={<PasswordEntry setUserById={setUserById}/>}/>
</Routes>
```

It's also helpful to include an element for the "/" path. This can be the same as some other path, like shown above, or different.

### The API Folder
Some custom APIs have been created for to make certain actions more consistent / simpler to implement.

##### Axios API
axios.js just sets the baseUrl for GET/POST requests. 
```js
// Don't import from 'axios'! We want our version!
import axios from '/api/axios'
```

##### Formatter API
formatter.js sets default currency formatter settings
```js
import formatter from '/api/formatter'
formatter.format(200) // Returns "$200.00"
```

### Displaying Notifications
Notifications are displayed in the NotificationContainer that lies outside the routes in App.js. Notifications can be created by any component and will display as an overlay on the entire application. 

In order to create a notitification, NotificationManager must be imported.
```js
import NotificationManager from 'react-notifications';
```

After it has been imported, notifications can be displayed by calling the following functions.
```js
NotificationManager.success("This one is green!", "Notification title...");
NotificationManager.info("This one is blue!", "It can have a different title, too!");
NotificationManager.warning("This one is orange.", "Maybe not the worst thing, but we thought we'd let you know.");
NotificationManager.error("This one is red!", "The sky is falling!");
```

There are a few other props, but they are currently unused in this application: timeOut, callback, and priority.
The order is as follows: NotificationManager.success(message, title, timeOut, callback, priority);
```js
NotificationManager.warning('Warning message', 'Close after 3000ms', 3000);                         // Closes after 3 seconds
NotificationManager.error('Error message', 'Click me!', 5000, () => { console.log("Ouch!"); });     // Closes after 5 seconds and has an on-click event
NotificationManager.error('High priority', 'Title', 1000, () => {}, true);                          // Priority is a boolean— high priority notifications are displayed at the top
```

### Prevent Default
Sometimes, you'll see the preventDefault() method called on events. The preventDefault() method of the Event interface tells the user agent that if the event does not get explicitly handled. Its default action should not be taken as it normally would be.

If an event isn't working as intended, try throwing in this line:
```js
function handleEvent(event) {
  event.preventDefault();
  // Whatever else you want to do with it
}
```

### Testing
Client tests are located in the /\__tests__ directory.

Tests should be surrounded by a describe(), and individual tests should have descriptive names.

Testing React components is rather simple. Add a "data-testid" value to the component that you would like to be able to reference from a test (or not, depending on how you want to query your component in testing) and then use one of the various queries to get that component as a constant in your test.

All of the documentation you should need is at (this)[https://github.com/testing-library/react-testing-library] link.

Components containing routes must be surrounded by a Router in the test. Here's an example of how to do that:
```js
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Authentication from '../../../components/login/authentication/Authentication';
import { BrowserRouter as Router } from "react-router-dom";

test("Authentication wrapper renders", () => {
    render(<Router><Authentication setUserById={() => {}}/></Router>);
    const authentication = screen.getByTestId("authentication-wrapper");
    expect(authentication).toBeVisible();
});
```

The only little hiccup is that tests run in a simuated browser with some limitations. The window.location cannot actually be changed in the browser, so links will have to be tested a little more creatively.