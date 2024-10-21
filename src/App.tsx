import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; //@ts-ignore

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <iframe
              title="Plode"
              src="/index.html"
              style={{
                width: "100%",
                height: "97.8vh",
                border: 0,
                overflow: "hidden",
                overflowClipMargin: "border-box",
              }}
              frameBorder="0"
              scrolling="no"
            />
          }
        />
        <Route
          path="/scratch"
          element={
            <iframe
              title="Plode"
              src="/scratch_build/index.html"
              style={{
                width: "100%",
                height: "97.8vh",
                border: 0,
                overflow: "hidden",
                overflowClipMargin: "border-box",
              }}
              frameBorder="0"
              scrolling="no"
            />
          }
        />
        <Route
          path="/scratch/pc1.0"
          element={
            <iframe
              title="Plode"
              src="/scratch_build/index.html?pc1.0"
              style={{
                width: "100%",
                height: "97.8vh",
                border: 0,
                overflow: "hidden",
                overflowClipMargin: "border-box",
              }}
              frameBorder="0"
              scrolling="no"
            />
          }
        />
        <Route
          path="/scratch/zing0.1"
          element={
            <iframe
              title="Plode"
              src="/scratch_build/index.html?zing0.1"
              style={{
                width: "100%",
                height: "97.8vh",
                border: 0,
                overflow: "hidden",
                overflowClipMargin: "border-box",
              }}
              frameBorder="0"
              scrolling="no"
            />
          }
        />
        <Route
          path="/scratch/zing1.0"
          element={
            <iframe
              title="Plode"
              src="/scratch_build/index.html?zing1.0"
              style={{
                width: "100%",
                height: "97.8vh",
                border: 0,
                overflow: "hidden",
                overflowClipMargin: "border-box",
              }}
              frameBorder="0"
              scrolling="no"
            />
          }
        />
        <Route
          path="/scratch/zing1.0s3"
          element={
            <iframe
              title="Plode"
              src="/scratch_build/index.html?zing1.0s3"
              style={{
                width: "100%",
                height: "97.8vh",
                border: 0,
                overflow: "hidden",
                overflowClipMargin: "border-box",
              }}
              frameBorder="0"
              scrolling="no"
            />
          }
        />
        <Route
          path="/scratch/hexapod"
          element={
            <iframe
              title="Plode"
              src="/scratch_build/index.html?hexapod"
              style={{
                width: "100%",
                height: "97.8vh",
                border: 0,
                overflow: "hidden",
                overflowClipMargin: "border-box",
              }}
              frameBorder="0"
              scrolling="no"
            />
          }
        />
        <Route
          path="/scratch/hexapod1.03s3"
          element={
            <iframe
              title="Plode"
              src="/scratch_build/index.html?hexapod1.0s3"
              style={{
                width: "100%",
                height: "97.8vh",
                border: 0,
                overflow: "hidden",
                overflowClipMargin: "border-box",
              }}
              frameBorder="0"
              scrolling="no"
            />
          }
        />
        <Route
          path="/scratch/roboki"
          element={
            <iframe
              title="Plode"
              src="/scratch_build/index.html?roboki"
              style={{
                width: "100%",
                height: "97.8vh",
                border: 0,
                overflow: "hidden",
                overflowClipMargin: "border-box",
              }}
              frameBorder="0"
              scrolling="no"
            />
          }
        />
        <Route
          path="/scratch/roboki"
          element={
            <iframe
              title="App1"
              src="/scratch_build/index.html?roboki"
              style={{
                width: "100%",
                height: "97.8vh",
                border: 0,
                overflow: "hidden",
                overflowClipMargin: "border-box",
              }}
              frameBorder="0"
              scrolling="no"
            />
          }
        />
        <Route
          path="/micropython"
          element={
            <iframe
              title="Plode"
              src="/micropython_build/index.html"
              style={{
                width: "100%",
                height: "97.8vh",
                border: 0,
                overflow: "hidden",
                overflowClipMargin: "border-box",
              }}
              frameBorder="0"
              scrolling="no"
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
