import "./AlbumCard.scss";
import "../Styles/colors.scss";
import { useCallback, useEffect, useState } from "react";
import { Toast } from "@capacitor/toast";
import VLC from "../Plugins/VLC";
import Loading from "./Loading";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import classNames from "classnames";
import AndroidTVPlugin from "../Plugins/AndroidTV";
import { useNavigate } from "react-router-dom";
import { IPlaylist } from "../Models/API/Responses/IPlaylistsResponse";


export default function PlaylistItemCard({ item, parentRef }: { item: IPlaylist, parentRef?: React.RefObject<any> }) {
    const [coverArt, setCoverArt] = useState<string>("");
    const [androidTv, setAndroidTv] = useState<boolean>(false);
    const navigate = useNavigate();
    const play = useCallback(async () => {
        const ret = await VLC.playPlaylist({ playlist: item.id, track: 0});
        if (ret.status === "error") {
            await Toast.show({ text: ret.error });
        }
        if (androidTv && ret.status === "ok") {
            navigate("/playing");
        }
    }, [item.id, androidTv, navigate]);
    const { focused, ref } = useFocusable({ onEnterPress: play });

    useEffect(() => {
        if (focused) {
            parentRef?.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "center" });
            ref.current.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        }
    }, [focused, parentRef, ref]);
    useEffect(() => {
        const func = async () => {
            const s = await VLC.getAlbumArt({ id: item.coverArt });
            if (s.status === "ok") {
                setCoverArt(s.value!);
            }
            setAndroidTv((await AndroidTVPlugin.get()).value);
        }
        func();
    }, [item]);



    return (
        <div ref={ref} className={classNames("d-flex", "flex-column", "align-items-center", "justify-content-between", "not-selectable" ,focused ? "album-item-focused" : "", "album-item")}
            onClick={() => play()}>
            <div className="d-flex align-items-center justify-content-center album-image-container">
                {coverArt === "" ? <Loading></Loading> : <img alt="" src={coverArt} className="album-image"></img>}
            </div>
            <div className=" d-flex flex-column align-items-start justify-content-end text-white no-overflow">
                <span>
                    {item.name}
                </span>
                <span>
                    {item.comment && item.comment !== "" ? item.comment : `${item.songCount} songs`}
                </span>
            </div>

        </div>
    )
}