import { TorrentMetadata } from "@/types/torrent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatBytes, formatDuration, formatSpeed } from "@/lib/utils";

interface TorrentInfoProps {
  metadata: TorrentMetadata;
}

const TorrentInfo = ({ metadata }: TorrentInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{metadata.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress: {(metadata.progress * 100).toFixed(1)}%</span>
            <span>
              {formatBytes(metadata.downloaded)} / {formatBytes(metadata.size)}
            </span>
          </div>
          <Progress value={metadata.progress * 100} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Download Speed</p>
            <p className="font-medium">{formatSpeed(metadata.downloadSpeed)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Upload Speed</p>
            <p className="font-medium">{formatSpeed(metadata.uploadSpeed)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Peers/Seeds</p>
            <p className="font-medium">
              {metadata.peers}/{metadata.seeds}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Time Remaining</p>
            <p className="font-medium">
              {formatDuration(metadata.timeRemaining)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Share Ratio</p>
            <p className="font-medium">{metadata.ratio.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Uploaded</p>
            <p className="font-medium">{formatBytes(metadata.uploaded)}</p>
          </div>
        </div>

        {/* Files */}
        <div className="space-y-2">
          <h3 className="font-medium">Files</h3>
          <div className="space-y-1">
            {metadata.files.map((file, index) => (
              <div
                key={index}
                className="text-sm flex justify-between items-center"
              >
                <span className="truncate flex-1">{file.name}</span>
                <span className="ml-4 text-muted-foreground">
                  {formatBytes(file.size)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TorrentInfo;
