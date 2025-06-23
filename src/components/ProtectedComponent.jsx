// // src/components/ProtectedComponent.js
// import { useMsal } from '@azure/msal-react';
// import { useEffect, useState } from 'react';
// import axios from 'axios';

// const ProtectedComponent = () => {
//   const { instance, accounts } = useMsal();
//   const [apiData, setApiData] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (accounts.length > 0) {
//       const request = {
//         scopes: ["api://your-backend-client-id/access_as_user"],
//         account: accounts[0]
//       };
      
//       instance.acquireTokenSilent(request)
//         .then(response => {
//           // Call your Spring Boot backend with the token
//           axios.get('http://localhost:8080/api/secured', {
//             headers: {
//               'Authorization': `Bearer ${response.accessToken}`
//             }
//           })
//           .then(res => setApiData(res.data))
//           .catch(err => setError(err.message));
//         })
//         .catch(err => {
//           instance.acquireTokenPopup(request)
//             .then(response => {
//               axios.get('http://localhost:8080/api/secured', {
//                 headers: {
//                   'Authorization': `Bearer ${response.accessToken}`
//                 }
//               })
//               .then(res => setApiData(res.data))
//               .catch(err => setError(err.message));
//             })
//             .catch(err => setError(err.message));
//         });
//     }
//   }, [accounts, instance]);

//   if (!accounts || accounts.length === 0) {
//     return <div>Please sign in to view this content.</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   return (
//     <div>
//       <h1>Welcome {accounts[0].name}!</h1>
//       {apiData && <pre>{JSON.stringify(apiData, null, 2)}</pre>}
//     </div>
//   );
// };

// export default ProtectedComponent;