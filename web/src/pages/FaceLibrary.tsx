import { baseUrl } from "@/api/baseUrl";
import Chip from "@/components/indicators/Chip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import useOptimisticState from "@/hooks/use-optimistic-state";
import { useEffect, useMemo, useRef, useState } from "react";
import { isDesktop } from "react-device-detect";
import { LuTrash } from "react-icons/lu";
import useSWR from "swr";

export default function FaceLibrary() {
  const [page, setPage] = useState<string>();
  const [pageToggle, setPageToggle] = useOptimisticState(page, setPage, 100);
  const tabsRef = useRef<HTMLDivElement | null>(null);

  // face data

  const { data: faceData } = useSWR("faces");

  const faces = useMemo<string[]>(
    () => (faceData ? Object.keys(faceData) : []),
    [faceData],
  );
  const faceImages = useMemo<string[]>(
    () => (pageToggle && faceData ? faceData[pageToggle] : []),
    [pageToggle, faceData],
  );

  useEffect(() => {
    if (!pageToggle && faces) {
      setPageToggle(faces[0]);
    }
    // we need to listen on the value of the faces list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faces]);

  return (
    <div className="flex size-full flex-col p-2">
      <div className="relative flex h-11 w-full items-center justify-between">
        <ScrollArea className="w-full whitespace-nowrap">
          <div ref={tabsRef} className="flex flex-row">
            <ToggleGroup
              className="*:rounded-md *:px-3 *:py-4"
              type="single"
              size="sm"
              value={pageToggle}
              onValueChange={(value: string) => {
                if (value) {
                  setPageToggle(value);
                }
              }}
            >
              {Object.values(faces).map((item) => (
                <ToggleGroupItem
                  key={item}
                  className={`flex scroll-mx-10 items-center justify-between gap-2 ${page == "UI settings" ? "last:mr-20" : ""} ${pageToggle == item ? "" : "*:text-muted-foreground"}`}
                  value={item}
                  data-nav-item={item}
                  aria-label={`Select ${item}`}
                >
                  <div className="capitalize">{item}</div>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ScrollBar orientation="horizontal" className="h-0" />
          </div>
        </ScrollArea>
      </div>
      {pageToggle && (
        <div className="flex gap-2">
          {faceImages.map((image: string) => (
            <FaceImage name={pageToggle} image={image} />
          ))}
        </div>
      )}
    </div>
  );
}

type FaceImageProps = {
  name: string;
  image: string;
};
function FaceImage({ name, image }: FaceImageProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative h-40"
      onMouseEnter={isDesktop ? () => setHovered(true) : undefined}
      onMouseLeave={isDesktop ? () => setHovered(false) : undefined}
      onClick={isDesktop ? undefined : () => setHovered(!hovered)}
    >
      {hovered && (
        <div className="absolute right-1 top-1">
          <Chip className="cursor-pointer rounded-md bg-gray-500 bg-gradient-to-br from-gray-400 to-gray-500">
            <LuTrash className="size-4 fill-destructive text-destructive" />
          </Chip>
        </div>
      )}
      <img
        className="h-40 rounded-md"
        src={`${baseUrl}clips/faces/${name}/${image}`}
      />
    </div>
  );
}
