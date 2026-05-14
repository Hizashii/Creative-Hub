Full Stack Development - build/application + documentation.
Introduction
Main task: Design & develop a Fullstack project using TypeScript.
You chose your own theme for the project – make sure it is cleared with KW & SMSJ.
First steps:
• Sketch out the data structure that you want to follow and implement
o JSON diagram, Schemas, UML and so on…
• Figure out the framework you want to work with
o VueJS, React, Angular, other JS frameworks/libraries
You need to think about the structure, and how you want to store and handle your data and users.
• Data: Your own REST-API and database: MongoDB, Express, Node etc.
o How do you want to store data? in in arrays, objects, references etc.? - It must be
online retrieved data (cloud based)
o Tracking and manipulating data
 How do you intend to control the flow of the user and handle the data. Smaller
or larger collections in database.
• Users: How to handle login, auth, navigational guards, security and more.
• Your sketch/design(low-fi or hi-fi) your own theme – the design is not a big part of the evalua-
tion, but it helps!
• UX: How is the user supposed to navigate through everything. Keep UX in mind when designing
and building you project.
• The structure of the code and the design patterns of these, will be taken into consideration
when evaluating. Several components (or composition functions) are better than a few very
large components. Fx. SOLID principles, especially Single responsibility principle (SRP) in the
frontend.
• Using TypeScript as a primary language
Project Requirements - must include
Project overview info
• Create either a MoSCoW model, Requirement Specification or User Stories
o Max 1 page: we prefer bullet-point setups. Concise and short
• Be very specific with the needs, ie: functionality for each component etc.
• This is the only document you need to hand-in on WiseFlow.
• Added bonus could be: flow chart / DB diagram (UML, …)
Front-end (VueJS or likewise)
• Component Based
• Divide code into smaller components/views: navigation, login, create project, edit/update,
etc
• Try to create nested components or Composables (composition functions if using Vue3 Com-
position API) or if using Pinia, use it as your logical center (you can divide Pinia up as well, into
files with modules, mutation, actions etc).
• Focus on creating code using a design paradigm (SRP) or …
• Component Based Programming must be a focus when creating Vue or React project. Angu-
lar project might have a different approach for optimization.
• Use Navigation guards to show different content, depending on if the user is logged in (as ad-
min, leader, etc) or not (if your project specifically doesn’t require login, clear it with KW/SMSJ)
• Login system for the administration. You can make your own, use Auth2 (Firebase) or the JWT
login tokens (SMSJ video).
Page 7
• Data and logic should use either Composition API or Pinia (or similar) state management to
control the data and consistency.
Back-end (REST-API)
• Designed and developed in a web application framework of your choice.
• Full CRUD routes (Create, Retrieve, Update and Delete). These must work on data from a
NoSQL database (not local data).
• User authentication on selected or all routes (registration and login)
• Test your endpoints using an appropriate program (Postman, Thunder, Insomnia etc.)
• Integrated with Swagger including endpoint documentation.
Live version + GitHub (hand-in)
• You must build your project and upload it to a live site and link it in the document
• GitLab Pages, Netlify, Firebase, render.com, old fashioned domain or somewhere else
o Link on how to: https://cli.vuejs.org/guide/deployment.html#general-guidelines
• You must upload and link to the VCS repository