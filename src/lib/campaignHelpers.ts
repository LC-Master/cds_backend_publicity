import { ISnapshotDto } from "../../types/dto.type";
import { IFile } from "../../types/file.type";
/**
 * @author Francisco A. Rojas F.
 * @description Extrae y aplana la lista de medios únicos de todas las campañas del DTO.
 * @param {ISnapshotDto} dto - DTO proveniente del CMS.
 * @returns {IFile[]} Lista de objetos simplificados para descarga y validación.
 */
export function extractMediaList(dto: ISnapshotDto): IFile[] {
  if (!dto?.data?.campaigns) return [];

  const mediaList: IFile[] = dto.data.campaigns.flatMap((campaign) => {
    const am = campaign.slots.am;
    const pm = campaign.slots.pm;

    return [...am, ...pm].map((slot) => ({
      id: slot.id,
      name: slot.name,
      checksum: slot.checksum,
    }));
  });

  if (dto.data.place_holder) {
    mediaList.push({ name: dto.data.place_holder.name, id: dto.data.place_holder.id, checksum: dto.data.place_holder.checksum });
  }

  const uniqueMediaList = mediaList.filter((media, index, self) =>
    index === self.findIndex((m) => m.id === media.id && m.name === media.name && m.checksum === media.checksum)
  );

  return uniqueMediaList as IFile[];
}
